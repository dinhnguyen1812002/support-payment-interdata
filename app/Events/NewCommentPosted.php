<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment->load('user:id,name,profile_photo_path');
    }

    public function broadcastOn()
    {
        return ['public'];
    }

    public function broadcastAs()
    {
        return 'chat';
    }
}
