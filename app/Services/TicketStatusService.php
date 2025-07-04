<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketStatusService
{
    /**
     * Update status of a single ticket
     */
    public function updateStatus(array $data): array
    {
        try {
            $ticket = Post::findOrFail($data['ticket_id']);
            $oldStatus = $ticket->status;
            
            $ticket->update(['status' => $data['status']]);

            Log::info('Ticket status updated', [
                'ticket_id' => $ticket->id,
                'old_status' => $oldStatus,
                'new_status' => $data['status'],
                'updated_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => 'Ticket status updated successfully',
                'ticket' => $ticket->fresh(),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to update ticket status', [
                'error' => $e->getMessage(),
                'ticket_id' => $data['ticket_id'],
                'status' => $data['status'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update ticket status',
            ];
        }
    }

    /**
     * Bulk update ticket statuses
     */
    public function bulkUpdateStatus(array $data): array
    {
        try {
            DB::beginTransaction();

            $updatedCount = 0;
            $failedTickets = [];

            foreach ($data['ticket_ids'] as $ticketId) {
                try {
                    $ticket = Post::findOrFail($ticketId);
                    $ticket->update(['status' => $data['status']]);
                    $updatedCount++;
                } catch (\Exception $e) {
                    $failedTickets[] = $ticketId;
                }
            }

            DB::commit();

            Log::info('Bulk status update completed', [
                'updated_count' => $updatedCount,
                'failed_count' => count($failedTickets),
                'new_status' => $data['status'],
                'updated_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "Successfully updated {$updatedCount} tickets",
                'updated_count' => $updatedCount,
                'failed_count' => count($failedTickets),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk status update failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $data['ticket_ids'],
                'status' => $data['status'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update ticket statuses',
            ];
        }
    }
}
