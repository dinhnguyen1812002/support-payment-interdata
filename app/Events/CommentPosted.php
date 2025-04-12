<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class CommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

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
            'comment' => $this->comment->load('user'), // Include user data
        ];
    }
}
