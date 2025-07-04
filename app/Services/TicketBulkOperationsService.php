<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketBulkOperationsService
{
    /**
     * Bulk update ticket priority
     */
    public function bulkUpdatePriority(array $data): array
    {
        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $data['ticket_ids'])
                ->update([
                    'priority' => $data['priority'],
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk priority update completed', [
                'ticket_count' => $updated,
                'new_priority' => $data['priority'],
                'updated_by' => auth()->id(),
                'reason' => $data['reason'] ?? null,
            ]);

            return [
                'success' => true,
                'message' => "{$updated} tickets updated to {$data['priority']} priority successfully",
                'updated_count' => $updated,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk priority update failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $data['ticket_ids'],
                'priority' => $data['priority'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update ticket priorities',
            ];
        }
    }

    /**
     * Bulk transfer tickets to different department
     */
    public function bulkTransferDepartment(array $data): array
    {
        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $data['ticket_ids'])
                ->update([
                    'department_id' => $data['department_id'],
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk department transfer completed', [
                'ticket_count' => $updated,
                'new_department_id' => $data['department_id'],
                'transferred_by' => auth()->id(),
                'reason' => $data['reason'] ?? null,
            ]);

            return [
                'success' => true,
                'message' => "{$updated} tickets transferred successfully",
                'updated_count' => $updated,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk department transfer failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $data['ticket_ids'],
                'department_id' => $data['department_id'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to transfer tickets',
            ];
        }
    }

    /**
     * Bulk add tags to tickets
     */
    public function bulkAddTags(array $data): array
    {
        try {
            DB::beginTransaction();

            $tickets = Post::whereIn('id', $data['ticket_ids'])->get();
            $tags = Tag::whereIn('id', $data['tag_ids'])->get();

            foreach ($tickets as $ticket) {
                $ticket->tags()->syncWithoutDetaching($data['tag_ids']);
            }

            DB::commit();

            Log::info('Bulk tags added', [
                'ticket_count' => $tickets->count(),
                'tag_count' => $tags->count(),
                'added_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "Tags added to {$tickets->count()} tickets successfully",
                'updated_count' => $tickets->count(),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk add tags failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $data['ticket_ids'],
                'tag_ids' => $data['tag_ids'],
            ]);

            return [
                'success' => false,
                'message' => 'Failed to add tags to tickets',
            ];
        }
    }

    /**
     * Bulk archive tickets
     */
    public function bulkArchive(array $ticketIds): array
    {
        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $ticketIds)
                ->update([
                    'status' => 'archived',
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk archive completed', [
                'ticket_count' => $updated,
                'archived_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "{$updated} tickets archived successfully",
                'updated_count' => $updated,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk archive failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $ticketIds,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to archive tickets',
            ];
        }
    }

    /**
     * Bulk close resolved tickets
     */
    public function bulkCloseResolved(array $ticketIds): array
    {
        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $ticketIds)
                ->where('status', 'resolved')
                ->update([
                    'status' => 'closed',
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk close resolved tickets completed', [
                'ticket_count' => $updated,
                'closed_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'message' => "{$updated} resolved tickets closed successfully",
                'updated_count' => $updated,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk close resolved tickets failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $ticketIds,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to close resolved tickets',
            ];
        }
    }
}
