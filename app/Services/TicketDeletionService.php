<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketDeletionService
{
    /**
     * Delete a single ticket
     */
    public function deleteTicket(int $ticketId): array
    {
        try {
            $ticket = Post::findOrFail($ticketId);
            $ticket->delete();

            Log::info('Ticket deleted', [
                'ticket_id' => $ticketId,
                'deleted_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => 'Ticket deleted successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to delete ticket', [
                'error' => $e->getMessage(),
                'ticket_id' => $ticketId,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to delete ticket',
            ];
        }
    }

    /**
     * Bulk delete tickets
     */
    public function bulkDelete(array $ticketIds): array
    {
        try {
            DB::beginTransaction();

            $deletedCount = 0;
            $failedTickets = [];

            foreach ($ticketIds as $ticketId) {
                try {
                    $ticket = Post::findOrFail($ticketId);
                    $ticket->delete();
                    $deletedCount++;
                } catch (\Exception $e) {
                    $failedTickets[] = $ticketId;
                }
            }

            DB::commit();

            Log::info('Bulk ticket deletion completed', [
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedTickets),
                'deleted_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} tickets",
                'deleted_count' => $deletedCount,
                'failed_count' => count($failedTickets),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk ticket deletion failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $ticketIds,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to delete tickets',
            ];
        }
    }
}
