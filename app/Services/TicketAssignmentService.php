<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketAssignmentService
{
    /**
     * Assign a single ticket to a user
     */
    public function assignTicket(array $data): array
    {
        try {
            $ticket = Post::findOrFail($data['ticket_id']);
            $assignee = User::findOrFail($data['assignee_id']);
            $currentUser = auth()->user();

            // Check if current user is admin
            if (!$currentUser->hasRole('admin')) {
                throw new \Exception('Only admin users can assign tickets');
            }

            // Check if assignee has employee role
            if (!$assignee->hasRole('employee')) {
                throw new \Exception('You can only assign tickets to employees');
            }



            $ticket->update([
                'assignee_id' => $data['assignee_id'],
                'status' => $ticket->status === 'open' ? 'in_progress' : $ticket->status,
            ]);

            Log::info('Ticket assigned', [
                'ticket_id' => $ticket->id,
                'assignee_id' => $assignee->id,
                'assigned_by' => auth()->id(),
                'notes' => $data['notes'] ?? null,
            ]);

            return [
                'success' => true,
                'message' => "Ticket assigned to {$assignee->name} successfully",
                'ticket' => $ticket->fresh(['assignee']),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to assign ticket', [
                'error' => $e->getMessage(),
                'ticket_id' => $data['ticket_id'],
                'assignee_id' => $data['assignee_id'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to assign ticket',
            ];
        }
    }

    /**
     * Bulk assign tickets to users
     */
    public function bulkAssign(array $data): array
    {
        try {
            $currentUser = auth()->user();
            $assignee = User::findOrFail($data['assignee_id']);

            // Check if current user is admin
            if (!$currentUser->hasRole('admin')) {
                throw new \Exception('Only admin users can assign tickets');
            }

            // Check if assignee has employee role
            if (!$assignee->hasRole('employee')) {
                throw new \Exception('You can only assign tickets to employees');
            }

            DB::beginTransaction();

            $assignedCount = 0;
            $failedTickets = [];

            foreach ($data['ticket_ids'] as $ticketId) {
                try {
                    $ticket = Post::findOrFail($ticketId);
                    $ticket->update([
                        'assignee_id' => $data['assignee_id'],
                        'status' => $ticket->status === 'open' ? 'in_progress' : $ticket->status,
                    ]);
                    $assignedCount++;
                } catch (\Exception $e) {
                    $failedTickets[] = $ticketId;
                }
            }
  
            DB::commit();

            Log::info('Bulk ticket assignment completed', [
                'assigned_count' => $assignedCount,
                'failed_count' => count($failedTickets),
                'assignee_id' => $data['assignee_id'],
                'assigned_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "Successfully assigned {$assignedCount} tickets",
                'assigned_count' => $assignedCount,
                'failed_count' => count($failedTickets),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk ticket assignment failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $data['ticket_ids'],
                'assignee_id' => $data['assignee_id'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to assign tickets',
            ];
        }
    }
}
