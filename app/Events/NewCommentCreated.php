<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public Comments $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel
     */
    public function broadcastOn()
    {
        // Gửi đến kênh riêng của chủ bài viết
        return new Channel('notifications-comment.'.$this->comment->post->user_id);
    }

    public function broadcastAs()
    {
        return 'new-comment-created';
    }

    public function broadcastWith()
    {
        return [
            'id' => (string) $this->comment->id,
            'data' => [
                'post_id' => $this->comment->post_id,
                'title' => $this->comment->post->title,
                'message' => "New Comment on your post: {$this->comment->comment}",
                'slug' => $this->comment->post->slug,
                'name' => $this->comment->user->name,
                'profile_photo_url' => $this->comment->user->profile_photo_path
                    ? asset('storage/'.$this->comment->user->profile_photo_path)
                    : 'https://ui-avatars.com/api/?name='.urlencode($this->comment->user->name).'&color=7F9CF5&background=EBF4FF',
                'categories' => $this->comment->post->categories->pluck('name')->toArray(),
                'type_notification' => 'comment',
            ],
            'read_at' => null,
            'created_at' => $this->comment->created_at->toISOString(),
            'type_notification' => 'comment',
        ];
    }
}
