<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewPostCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function broadcastOn(): Channel
    {
        // Broadcast đến kênh của phòng ban
        return new Channel('department.'.$this->post->department_id);
    }

    public function broadcastAs(): string
    {
        return 'new-post-created';
    }

    public function broadcastWith(): array
    {
        return [
            'post' => $this->post->load('user', 'categories', 'tags'),
        ];
    }
}
