<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('post.'.$this->comment->post_id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'CommentPosted';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        try {
            // Load user relationships if not already loaded
            $this->comment->load(['user.roles', 'user.departments', 'allReplies.user.roles', 'allReplies.user.departments']);

            // Check if user exists
            if (!$this->comment->user) {
                return [
                    'comment' => [
                        'id' => $this->comment->id,
                        'content' => $this->comment->comment,
                        'comment' => $this->comment->comment,
                        'created_at' => $this->comment->created_at->toISOString(),
                        'is_hr_response' => $this->comment->is_hr_response ?? false,
                        'user' => [
                            'id' => 0,
                            'name' => 'Unknown User',
                            'email' => '',
                            'profile_photo_path' => null,
                            'roles' => [],
                            'departments' => [],
                        ],
                        'parent_id' => $this->comment->parent_id,
                        'replies' => [],
                    ],
                ];
            }

            return [
                'comment' => [
                    'id' => $this->comment->id,
                    'content' => $this->comment->comment, // Map to 'content' for frontend consistency
                    'comment' => $this->comment->comment, // Keep original field too
                    'created_at' => $this->comment->created_at->toISOString(),
                    'is_hr_response' => $this->comment->is_hr_response ?? false,
                    'user' => [
                        'id' => $this->comment->user->id,
                        'name' => $this->comment->user->name,
                        'email' => $this->comment->user->email,
                        'profile_photo_path' => $this->comment->user->profile_photo_path,
                        'roles' => $this->comment->user->getRoleNames()->toArray(),
                        'departments' => $this->comment->user->departments->pluck('name')->toArray(),
                    ],
                    'parent_id' => $this->comment->parent_id,
                    'replies' => $this->comment->allReplies->map(function ($reply) {
                        // Check if reply user exists
                        if (!$reply->user) {
                            return [
                                'id' => $reply->id,
                                'content' => $reply->comment,
                                'created_at' => $reply->created_at->toISOString(),
                                'is_hr_response' => $reply->is_hr_response ?? false,
                                'user' => [
                                    'id' => 0,
                                    'name' => 'Unknown User',
                                    'email' => '',
                                    'profile_photo_path' => null,
                                    'roles' => [],
                                    'departments' => [],
                                ],
                                'parent_id' => $reply->parent_id,
                                'replies' => [],
                            ];
                        }

                        return [
                            'id' => $reply->id,
                            'content' => $reply->comment,
                            'created_at' => $reply->created_at->toISOString(),
                            'is_hr_response' => $reply->is_hr_response ?? false,
                            'user' => [
                                'id' => $reply->user->id,
                                'name' => $reply->user->name,
                                'email' => $reply->user->email,
                                'profile_photo_path' => $reply->user->profile_photo_path,
                                'roles' => $reply->user->getRoleNames()->toArray(),
                                'departments' => $reply->user->departments->pluck('name')->toArray(),
                            ],
                            'parent_id' => $reply->parent_id,
                            'replies' => [],
                        ];
                    })->toArray(),
                ],
            ];
        } catch (\Exception $e) {
            // Log error and return minimal data
            \Log::error('Error in CommentPosted broadcastWith: ' . $e->getMessage());
            return [
                'comment' => [
                    'id' => $this->comment->id,
                    'content' => $this->comment->comment,
                    'created_at' => now()->toISOString(),
                    'user' => [
                        'id' => 0,
                        'name' => 'Unknown User',
                    ],
                    'replies' => [],
                ],
            ];
        }
    }
}
