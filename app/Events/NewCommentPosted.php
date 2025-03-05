<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function broadcastOn()
    {
        return new PrivateChannel('post.'.$this->comment->post_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->comment->id,
            'comment' => $this->comment->comment,
            'parent_id' => $this->comment->parent_id,
            'created_at' => $this->comment->created_at->diffForHumans(),
            'user' => [
                'id' => $this->comment->user->id,
                'name' => $this->comment->user->name,
                'profile_photo_path' => $this->comment->user->profile_photo_path,
            ],
        ];
    }
}
