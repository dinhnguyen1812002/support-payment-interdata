<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReplyComment
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $comment;

    public $parent_id;

    public function __construct(Comments $comment, string $parent_id)
    {
        $this->comment = $comment;
        $this->parent_id = $parent_id;

    }

    public function broadcastOn()
    {
        return new Channel('reply.'.$this->comment->post_id);
    }
}
