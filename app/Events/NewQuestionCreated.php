<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;


class NewQuestionCreated implements ShouldBroadcast
{
    use SerializesModels;

    public $question;

    public function __construct($question)
    {
        $this->question = $question;
    }

    public function broadcastOn()
    {
        return new Channel('questions');
    }

    public function broadcastAs()
    {
        return 'new-question';
    }

    public function broadcastWith()
    {
        return [
            'title' => $this->question['title'],
            'url' => $this->question['url'],
        ];
    }
}
