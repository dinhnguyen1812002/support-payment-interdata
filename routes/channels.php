<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('post.{postId}', function ($user, $postId) {
    return $user && Post::find($postId) !== null; // Ensure user is authenticated and post exists
});

Broadcast::channel('user.{id}', function ($user, $id) {
    \Log::info('Channel auth attempt', ['user' => $user, 'id' => $id]);

    return $user && (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
