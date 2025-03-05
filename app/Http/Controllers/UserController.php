<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Jetstream\Http\Controllers\Inertia\UserProfileController;

class UserController extends UserProfileController
{
    public function show(Request $request)
    {
        $posts = Post::query()
            ->where('user_id', auth()->id())
            ->withCount(['comments', 'upvotes']) // Đếm số comments và upvotes
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->orderByDesc('upvotes_count') // Sắp xếp theo lượng upvote giảm dần
            ->paginate(10);

        return Inertia::render('Profile/Show', [
            'sessions' => $this->sessions($request)->all(),
            'confirmsTwoFactorAuthentication' => $request->session()->get('confirmsTwoFactorAuthentication'),
            'posts' => collect($posts->items())->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'created_at' => Carbon::parse($post->created_at)->format('d/m/Y'),
                    'is_published' => $post->is_published,
                    'comments_count' => $post->comments_count,
                    'upvotes_count' => $post->upvotes_count,
                    'slug' => $post->slug,
                ];
            }),
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
            'keyword' => $request->search ?? '',
            'notifications' => auth()->user()->unreadNotifications,
        ]);
    }
}
