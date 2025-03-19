<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class AdminController extends Controller
{
    use AuthorizesRequests;

    public function dashboard()
    {
        $this->authorize('view admin dashboard');

        $posts = Post::with(['user:id,name,profile_photo_path', 'categories'])
            ->withCount('upvotes')
            ->latest()
            ->paginate(10);

        $topVotedPosts = Post::with(['user:id,name,profile_photo_path'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->take(5)
            ->get();

        $currentUser = auth()->user();

        return Inertia::render('Admin/Dashboard', [
            'posts' => $posts,
            'topVotedPosts' => $topVotedPosts,
            'user' => [
                'name' => $currentUser->name,
                'profile_photo_path' => $currentUser->profile_photo_path,
            ],
        ]);
    }
}
