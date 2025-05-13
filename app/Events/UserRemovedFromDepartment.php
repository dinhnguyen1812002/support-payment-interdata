<?php

namespace App\Events;

use App\Models\Departments;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRemovedFromDepartment
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $user;

    public $department;

    public function __construct(User $user, Departments $department)
    {
        $this->user = $user;
        $this->department = $department;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel
     */
    public function broadcastOn()
    {
        return new Channel('notifications');
    }

    public function broadcastAs()
    {
        return 'user-removed-from-department';
    }

    public function broadcastWith()
    {
        return [
            'user_id' => $this->user->id,
            'department_id' => $this->department->id,
            'message' => "{$this->user->name} has been removed from {$this->department->name}",
        ];
    }
}
