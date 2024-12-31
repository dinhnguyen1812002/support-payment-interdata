<?php

namespace App\Providers;

use App\Models\Comments;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot()
    {
        Gate::define('delete-comment', function (User $user, Comments $comment) {
            return $user->id === $comment->user_id;
        });
    }
}
