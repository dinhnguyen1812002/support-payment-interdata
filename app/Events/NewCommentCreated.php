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

    public Comments $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn(): Channel
    {
        // Ensure post and user exist before broadcasting
        if (!$this->comment->post || !$this->comment->post->user) {
            // Return a dummy channel that won't be used
            return new Channel('dummy-channel');
        }

        return new Channel('notifications-comment.'.$this->comment->post->user_id);
    }

    public function broadcastAs(): string
    {
        return 'new-comment-created';
    }

    public function broadcastWith(): array
    {
        // Ensure post and user exist before broadcasting
        if (!$this->comment->post || !$this->comment->post->user || !$this->comment->user) {
            return [
                'id' => (string) $this->comment->id,
                'data' => [
                    'post_id' => (string) $this->comment->post_id,
                    'title' => 'Unknown Post',
                    'message' => "New comment: {$this->comment->comment}",
                    'slug' => '',
                    'name' => 'Unknown User',
                    'profile_photo_url' => null,
                    'categories' => [],
                    'type_notification' => 'comment',
                ],
                'read_at' => null,
                'created_at' => $this->comment->created_at->diffForHumans(),
                'type' => 'comment',
            ];
        }

        return [
            'id' => (string) $this->comment->id,
            'data' => [
                'post_id' => (string) $this->comment->post_id,
                'title' => $this->comment->post->title,
                'message' => "New comment on your post: {$this->comment->comment}",
                'slug' => $this->comment->post->slug,
                'name' => $this->comment->user->name,
                'profile_photo_url' => $this->comment->user->profile_photo_path
                    ? asset('storage/'.$this->comment->user->profile_photo_path)
                    : null,
                'categories' => $this->comment->post->categories ? $this->comment->post->categories->pluck('name')->toArray() : [],
                'type_notification' => 'comment',
            ],
            'read_at' => null,
            'created_at' => $this->comment->created_at->diffForHumans(),
            'type' => 'comment',
        ];
    }
}
