<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewQuestionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('notifications');
    }

    public function broadcastAs(): string
    {
        return 'new-question-created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => (string) $this->post->id,
            'data' => [
                'post_id' => (string) $this->post->id,
                'title' => $this->post->title,
                'message' => "New post: {$this->post->title}",
                'slug' => $this->post->slug,
                'name' => $this->post->user->name,
                'profile_photo_url' => $this->post->user->profile_photo_url,
                'categories' => $this->post->categories->pluck('title')->toArray(),
                'type_notification' => 'post',
            ],
            'created_at' => $this->post->created_at->diffForHumans(),
            'read_at' => null,
            'type' => 'post',
        ];
    }
}
