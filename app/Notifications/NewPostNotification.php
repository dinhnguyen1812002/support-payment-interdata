<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
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
        return [ 'database']; // Thêm 'mail'
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject("Câu hỏi mới: {$this->post->title}")
            ->line("Có một câu hỏi mới từ {$this->post->user->name}:")
            ->line($this->post->title)
            ->action('Xem bài viết', url('/posts/'.$this->post->slug))
            ->line('Cảm ơn bạn đã theo dõi!');
    }

    public function toArray($notifiable)
    {
        return [
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'message' => "New Question : {$this->post->title}",
            'slug' => $this->post->slug,
            'name' => $this->post->user->name,
            'profile_photo_url' => $this->post->user->profile_photo_path
                ? asset('storage/'.$this->post->user->profile_photo_path)
                : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
            'categories' => $this->post->categories->pluck('name')->toArray(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => $this->id, // Include notification ID
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'slug' => $this->post->slug,
            'message' => "Bài viết mới: {$this->post->title}",
            'name' => $this->post->user->name,
            'profile_photo_url' => $this->post->user->profile_photo_path
                ? asset('storage/'.$this->post->user->profile_photo_path)
                : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
            'categories' => $this->post->categories->pluck('name')->toArray(),
            'created_at' => now()->toIso8601String(),
        ]);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->post->user_id);
    }
}
