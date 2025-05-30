<?php

namespace App\Providers;

use App\Models\Comments;
use App\Models\Departments;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Policies\DepartmentPolicy;
use App\Policies\PostPolicy;
use App\Policies\TagPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class => PostPolicy::class,
        Departments::class => DepartmentPolicy::class,
        Tag::class => TagPolicy::class,
    ];

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
        //        // Register the policies
        //        $this->registerPolicies();

        Gate::define('delete-comment', function (User $user, Comments $comment) {
            return $user->id === $comment->user_id;
        });
    }
}
