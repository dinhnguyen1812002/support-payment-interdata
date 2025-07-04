<?php

namespace App\Services;

use App\Events\CommentPosted;
use App\Events\NewCommentCreated;
use App\Models\Comments;
use App\Models\Post;
use App\Notifications\NewCommentNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketResponseService
{
    /**
     * Add a response to a ticket
     */
    public function addResponse(Post $ticket, array $data): array
    {
        try {
            DB::beginTransaction();

            // Create the comment
            $comment = Comments::create([
                'comment' => $data['content'],
                'user_id' => auth()->id(),
                'post_id' => $ticket->id,
                'parent_id' => $data['parent_id'] ?? null,
                'is_hr_response' => $data['is_hr_response'] ?? false,
            ]);

            // Update ticket's updated_at timestamp
            $ticket->touch();

            // If this is an HR response and ticket is open, mark as in_progress
            if ($data['is_hr_response'] && $ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }

            DB::commit();

            Log::info('Ticket response added', [
                'ticket_id' => $ticket->id,
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
                'is_hr_response' => $data['is_hr_response'] ?? false,
            ]);

            // Load the comment with user relationship
            $comment->load(['user.roles', 'user.departments']);

            // Broadcast real-time events (to everyone including sender)
            broadcast(new CommentPosted($comment));
            broadcast(new NewCommentCreated($comment));

            // Notify ticket owner if different from responder
            $this->notifyTicketOwner($ticket, $comment);

            return [
                'success' => true,
                'message' => 'Response added successfully',
                'comment' => $comment,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add ticket response', [
                'error' => $e->getMessage(),
                'ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to add response',
            ];
        }
    }

    /**
     * Notify ticket owner about new comment
     */
    private function notifyTicketOwner(Post $ticket, Comments $comment): void
    {
        $ticketOwner = $ticket->user;
        if ($ticketOwner->id !== auth()->id()) {
            $ticketOwner->notify(new NewCommentNotification($comment));
        }
    }

    /**
     * Get formatted comments for a ticket
     */
    public function getFormattedComments(Post $ticket): array
    {
        return $ticket->getFormattedComments()->toArray();
    }
}
