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

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('notifications-comment.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('post.{postId}', function ($user, $postId) {
    return true; // Allow all users to listen; restrict as needed
});

Broadcast::channel('reply.{postId}', function ($user, $postId) {
    return true; // Allow all users to listen; restrict as needed
});

