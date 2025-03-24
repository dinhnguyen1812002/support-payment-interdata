<?php

namespace App\Notifications;

use App\Models\Comments;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment;
    }

    public function via($notifiable)
    {
        return ['mail', 'database']; // Gửi qua email và lưu vào database
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Bình luận mới trên bài viết của bạn')
            ->greeting("Xin chào {$notifiable->name}!")
            ->line("{$this->comment->user->name} đã bình luận trên bài viết của bạn: **{$this->comment->post->title}**")
            ->line("Nội dung: {$this->comment->comment}")
            ->action('Xem bình luận', url('/posts/'.$this->comment->post->slug.'#comment-'.$this->comment->id))
            ->line('Cảm ơn bạn đã sử dụng dịch vụ!');
    }

    public function toArray($notifiable)
    {
        return [
            'post_id' => $this->comment->post_id,
            'title' => $this->comment->post->title,
            'message' => "You have new comment in {$this->comment->post->title}",
            'slug' => $this->comment->post->slug,
            'name' => $this->comment->user->name,
            'profile_photo_url' => $this->comment->user->profile_photo_path
                ? asset('storage/'.$this->comment->user->profile_photo_path)
                : 'https://ui-avatars.com/api/?name='.urlencode($this->comment->user->name).'&color=7F9CF5&background=EBF4FF',
            'comment_id' => $this->comment->id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'comment' => [
                'id' => $this->comment->id,
                'comment' => $this->comment->comment,
                'user' => [
                    'name' => $this->comment->user->name,
                    'profile_photo_url' => $this->comment->user->profile_photo_path
                        ? asset('storage/'.$this->comment->user->profile_photo_path)
                        : 'https://ui-avatars.com/api/?name='.urlencode($this->comment->user->name).'&color=7F9CF5&background=EBF4FF',
                ],
                'parent_id' => $this->comment->parent_id,
                'post_id' => $this->comment->post_id,
                'created_at' => $this->comment->created_at->toISOString(),
            ],
        ]);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->comment->post->user->id);
    }
}
