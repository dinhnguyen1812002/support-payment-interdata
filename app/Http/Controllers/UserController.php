<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Jetstream\Http\Controllers\Inertia\UserProfileController;

class UserController extends UserProfileController
{
    use AuthorizesRequests;

    public function show(Request $request)
    {
        $posts = Post::query()
            ->where('user_id', auth()->id())
            ->withCount(['comments', 'upvotes']) // Đếm số comments và upvotes
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
//            ->orderByDesc('upvotes_count')
            ->latest()
            ->paginate(10);

        $department = auth()->user()->departments->first();

        return Inertia::render('Profile/Show', [
            'sessions' => $this->sessions($request)->all(),
            'confirmsTwoFactorAuthentication' => $request->session()->get('confirmsTwoFactorAuthentication'),
            'posts' => collect($posts->items())->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'created_at' => Carbon::parse($post->created_at)->format('d/m/Y'),
                    'deleted_at' => Carbon::parse($post->deleted_at)->format('d/m/Y'),
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
            'department' => $department,
            'notifications' => auth()->user()->unreadNotifications,
        ]);
    }

    public function index(Request $request): \Inertia\Response
    {
        $this->authorize('view admin dashboard');

        $search = $request->input('search', '');

        $users = User::query()
            ->select(['id', 'name', 'email', 'profile_photo_path', 'created_at'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->with(['roles:name']) // Eager-load roles
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => [
                'data' => collect($users->items())->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'profile_photo_path' => $user->profile_photo_path,
                        'created_at' => $user->created_at->toDateTimeString(),
                        'roles' => $user->roles->pluck('name')->toArray(),
                    ];
                }),

                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'next_page_url' => $users->nextPageUrl(),
                'prev_page_url' => $users->previousPageUrl(),
            ],
            'keyword' => $search,
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'data' => $notification->data,
                ];
            })->toArray() : [],
        ]);
    }
}
