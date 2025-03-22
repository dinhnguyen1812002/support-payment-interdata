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
            'slug' => $this->post->slug,
            'user' => [
                'name' => $this->post->user->name,
                'profile_photo_url' => $this->post->user->profile_photo_path
                    ? asset('storage/'.$this->post->user->profile_photo_path)
                    : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
            ],
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
