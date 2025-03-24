<?php

namespace App\Events;

use App\Models\Comments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(Comments $comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn()
    {
        return new Channel('post.'.$this->comment->post_id.'.comments');
    }

    public function broadcastAs()
    {
        return 'NewCommentPosted';
    }

    public function broadcastWith()
    {
        return [
            'comment' => [
                'id' => $this->comment->id,
                'comment' => $this->comment->comment,
                'user' => [
                    'name' => $this->comment->user->name,
                    'profile_photo_path' => $this->comment->user->profile_photo_path
                        ? asset('storage/'.$this->comment->user->profile_photo_path)
                        : 'https://ui-avatars.com/api/?name='.urlencode($this->comment->user->name).'&color=7F9CF5&background=EBF4FF',
                ],
                'parent_id' => $this->comment->parent_id,
                'post_id' => $this->comment->post_id,
                'created_at' => $this->comment->created_at->toISOString(),
            ],
        ];
    }
}
