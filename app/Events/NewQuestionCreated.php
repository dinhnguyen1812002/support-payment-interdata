<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewQuestionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->post->user_id);
    }

    public function broadcastWith()
    {
        return [
            'title' => $this->post->title,
            'url' => "/posts/{$this->post->slug}",
            'user' => [
                'id' => $this->post->user->id,
                'name' => $this->post->user->name,
            ],
        ];
    }
}
