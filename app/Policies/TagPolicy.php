<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TagPolicy
{
    use HandlesAuthorization;

    public function create(User $user)
    {
        return $user->hasRole('admin'); // Example: only admins can create tags
    }

    public function update(User $user, Tag $tag)
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Tag $tag)
    {
        return $user->hasRole('admin');
    }
}
