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

    public function broadcastOn()
    {
        return new Channel('post.'.$this->comment->post_id);
    }

    public function broadcastWith()
    {
        return [
            'comment' => [
                'id' => $this->comment->id,
                'comment' => $this->comment->comment,
                'post_id' => $this->comment->post_id,
                'parent_id' => $this->comment->parent_id,
                'created_at' => $this->comment->created_at,
                'updated_at' => $this->comment->updated_at,
                'user' => [
                    'id' => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'email' => $this->comment->user->email,
                    'avatar' => $this->comment->user->avatar ?? null,
                ],
                'replies' => [], // New comments start with empty replies
            ]
        ];
    }

    public function broadcastAs()
    {
        return 'CommentPosted';
    }
}
