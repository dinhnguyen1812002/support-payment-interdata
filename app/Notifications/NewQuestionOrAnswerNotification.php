<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuestionOrAnswerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    private $type;

    private $data;

    public function __construct($type, $data)
    {
        $this->type = $type;
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url($this->data['url']);

        return (new MailMessage)
            ->subject('Có một cập nhật mới trên diễn đàn!')
            ->greeting('Xin chào, '.$notifiable->name)
            ->line($this->type === 'question'
                ? 'Có một câu hỏi mới: "'.$this->data['title'].'"'
                : 'Câu hỏi của bạn đã được trả lời!')
            ->action('Xem chi tiết', $url)
            ->line('Cảm ơn bạn đã tham gia diễn đàn của chúng tôi!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return DatabaseMessage
     */
    public function toDatabase($notifiable)
    {
        return new DatabaseMessage([
            'type' => $this->type,
            'message' => $this->type === 'question'
                ? 'Có một câu hỏi mới: "'.$this->data['title'].'"'
                : 'Câu hỏi của bạn đã được trả lời!',
            'url' => $this->data['url'],
            'title' => $this->data['title'],
        ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'message' => $this->type === 'question'
                ? 'Có một câu hỏi mới: "'.$this->data['title'].'"'
                : 'Câu hỏi của bạn đã được trả lời!',
            'url' => $this->data['url'],
            'title' => $this->data['title'],
        ];
    }
}
