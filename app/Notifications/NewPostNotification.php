<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewPostNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'message' => "Bài viết mới: {$this->post->title}",
            'author' => $this->post->user->name,
            'slug' => $this->post->slug,
            'avatar' => $this->post->user->avatar, // Thêm avatar nếu có trong model User
            'categories' => $this->post->categories->pluck('name')->toArray(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'slug' => $this->post->slug,
            'message' => "Bài viết mới: {$this->post->title}",
        ]);
    }
}
