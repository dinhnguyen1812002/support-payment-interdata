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
        return ['database', 'mail']; // Lưu vào cơ sở dữ liệu
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
            'id' => $this->post->id,
            'data' => [
                'post_id' => $this->post->id,
                'title' => $this->post->title,
                'slug' => $this->post->slug,
                'message' => "New post from {$this->post->product_name }: {$this->post->title}",
                'name' => $this->post->user->name,
                'profile_photo_url' => $this->post->user->profile_photo_path
                    ? asset('storage/'.$this->post->user->profile_photo_path)
                    : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
                'tags' => $this->post->tags->pluck('name')->toArray(),
                'categories' => $this->post->categories->pluck('title')->toArray(),
                'product_id' => $this->post->product_id,
                'product_name' => $this->post->product_name,
            ],
            'created_at' => now()->toDateTimeString(),
            'read_at' => null,
        ];
    }
}
