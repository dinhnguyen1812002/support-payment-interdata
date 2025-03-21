<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    use AuthorizesRequests;

    public function dashboard()
    {
        $this->authorize('view admin dashboard');

        // Lấy 5 bài viết có nhiều vote nhất
        $posts = Post::with(['user:id,name,profile_photo_path,email'])
            ->withCount(['upvotes', 'comments'])
            ->orderBy('upvotes_count', 'desc')
            ->take(5)
            ->get();

        $currentUser = auth()->user();

        return Inertia::render('Admin/Dashboard', [
            'posts' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'status' => $post->is_published ? 'public' : 'draft',
                    'vote' => (string) $post->upvotes_count,
                    'comment' => $post->comments_count,
                    'user' => [
                        'name' => $post->user->name,
                        'email' => $post->user->email,
                        'profile_photo_path' => $post->user->profile_photo_path,
                    ],
                ];
            }),
            'user' => [
                'name' => $currentUser->name,
                'email' => $currentUser->email,
                'profile_photo_path' => $currentUser->profile_photo_path,
            ],
        ]);
    }

    public function getAllPost(Request $request)
    {
        $posts = Post::with(['user:id,name,profile_photo_path,email'])
            ->withCount(['upvotes', 'comments'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Post', [
            'data' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'status' => $post->is_published ? 'published' : 'draft',
                    'votes' => $post->upvotes_count,
                    'comments' => $post->comments_count,
                    'createdAt' => $post->created_at->toISOString(),
                    'updatedAt' => $post->updated_at->toISOString(),
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'email' => $post->user->email,
                        'avatarUrl' => $post->user->profile_photo_path
                            ? asset('storage/'.$post->user->profile_photo_path)
                            : 'https://ui-avatars.com/api/?name='.urlencode($post->user->name).'&color=7F9CF5&background=EBF4FF',
                    ],
                ];
            })->values()->all(),
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
        ]);
    }

    public function getAllCategory(Request $request)
    {

        $categories = Category::select(['id', 'title', 'slug', 'description'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Categories', [
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'title' => $category->title,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'posts_count' => $category->posts_count,
                ];
            })->values()->all(),
            'pagination' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'next_page_url' => $categories->nextPageUrl(),
                'prev_page_url' => $categories->previousPageUrl(),
            ],
        ]);
    }
}
