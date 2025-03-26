<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q', ''); // Từ khóa tìm kiếm

        // Truy vấn các bài viết public khớp với từ khóa
        $posts = Post::where('is_published', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->with('user') // Load thông tin user
            ->withCount('comments') // Đếm số bình luận
            ->withCount('upvotes') // Đếm số vote
            ->limit(10) // Giới hạn 10 kết quả
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'content' => substr(strip_tags($post->content), 0, 100).'...',
                    'user' => [
                        'name' => $post->user->name,
                        'profile_photo_path' => $post->user->profile_photo_path
                            ? asset('storage/'.$post->user->profile_photo_path)
                            : 'https://ui-avatars.com/api/?name='.urlencode($post->user->name).'&color=7F9CF5&background=EBF4FF',
                    ],
                    'upvotes_count' => $post->upvotes_count,
                    'comments_count' => $post->comments_count,
                ];
            });

        // Trả về dữ liệu qua Inertia
        return Inertia::render('Search/Results', [
            'searchResults' => $posts,
            'query' => $query,
        ]);
    }
}
