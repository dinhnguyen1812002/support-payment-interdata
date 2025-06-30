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
        // Load user relationships if not already loaded
        $this->comment->load(['user.roles', 'user.departments']);

        return [
            'comment' => [
                'id' => $this->comment->id,
                'comment' => $this->comment->comment,
                'created_at' => $this->comment->created_at->toISOString(),
                'user' => [
                    'id' => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'profile_photo_path' => $this->comment->user->profile_photo_path,
                    'roles' => $this->comment->user->getRoleNames()->toArray(),
                    'departments' => $this->comment->user->departments->pluck('name')->toArray(),
                ],
                'parent_id' => $this->comment->parent_id,
                'replies' => [],
            ],
        ];
    }
}
