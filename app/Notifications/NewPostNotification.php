<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPostNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail($notifiable): MailMessage
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
            'content' => $this->post->getExcerpt(),
            'slug' => $this->post->slug,
            'message' => "New post created: {$this->post->title}",
            'name' => $this->post->user->name,
            'profile_photo_url' => $this->post->user->profile_photo_path
                ? asset('storage/'.$this->post->user->profile_photo_path)
                : 'https://ui-avatars.com/api/?name='.urlencode($this->post->user->name).'&color=7F9CF5&background=EBF4FF',
            'tags' => $this->post->tags->pluck('name')->toArray(),
            'categories' => $this->post->categories->pluck('title')->toArray(),
            'product_id' => $this->post->product_id,
            'product_name' => $this->post->product_name,
            'created_at' => $this->post->created_at->diffForHumans(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => $this->post->id,
            'data' => $this->toArray($notifiable),
            'created_at' => now()->diffForHumans(),
            'read_at' => null,
        ]);
    }

    public function broadcastOn()
    {
        return new Channel('notifications');
    }
}
