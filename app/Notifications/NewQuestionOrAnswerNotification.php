<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewQuestionOrAnswerNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast']; // Lưu vào DB và gửi qua Reverb
    }

    public function toArray($notifiable)
    {
        return [
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'message' => "Bài viết mới: {$this->post->title}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'message' => "Bài viết mới: {$this->post->title}",
        ]);
    }
}
