<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostCreatedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Ticket Created')
            ->line('A new ticket has been created: '.$this->post->title)
            ->action('View Ticket', url('/posts/'.$this->post->slug))
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
            'department' => $this->post->department->name ?? 'N/A',
        ];
    }
}
