<?php

namespace App\Listeners;

use App\Events\CommentCreated;
use App\Notifications\NewCommentNotification;

class SendNewCommentNotification
{
    public function handle(CommentCreated $event)
    {
        $comment = $event->comment;
        $postOwner = $comment->post->user;

        if ($postOwner->id !== $comment->user_id) {
            $postOwner->notify(new NewCommentNotification($comment));
        }
    }
}
