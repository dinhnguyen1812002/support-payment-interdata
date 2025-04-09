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

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function via($notifiable)
    {
        return ['database']; // Lưu vào cơ sở dữ liệu
    }

    public function broadcastOn()
    {
        // Use a public channel for simplicity; adjust as needed
        return new Channel('notifications');
    }

    public function broadcastAs()
    {
        return 'new-question-created';
    }

    public function broadcastWith()
    {
        return [
            'id' => (string) $this->post->id, // Match Notification interface
            'data' => [
                'post_id' => $this->post->id,
                'title' => $this->post->title,
                'message' => "New Question: {$this->post->title}",
                'slug' => $this->post->slug,
                'name' => $this->post->user->name,
                'profile_photo_url' => $this->post->user->profile_photo_path
                    ? asset('storage/'.$this->post->user->profile_photo_path)
                    : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
                'categories' => $this->post->categories->pluck('name')->toArray(),
            ],
            'read_at' => null,
            'created_at' => now()->toISOString(),
            'type' => 'post',
        ];
    }
}
