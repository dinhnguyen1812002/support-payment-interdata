<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuestionNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
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
                : null,
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
}
