<?php

namespace App\Services;

use App\Models\Post;

class PostService
{
    //    public function getPosts($search = '', $paginate = 6, )
    //    {
    //        return Post::with(['user', 'categories'])
    //            ->withCount('upvotes')
    //            ->when($search, function ($query, $search) {
    //                $query->where(function ($q) use ($search) {
    //                    $q->where('title', 'LIKE', "%{$search}%")
    //                        ->orWhere('content', 'LIKE', "%{$search}%");
    //                });
    //            })
    //            ->orderBy('upvotes_count', 'desc')
    //            ->latest()
    //            ->paginate((int) $paginate);
    //    }
    public function getPosts($search = '', $paginate = 6, $sort = 'latest')
    {
        return Post::with(['user:id,name,profile_photo_path', 'categories:id,title'])
            ->withCount('upvotes')
            ->when($search, function ($query, $search) {
                $query->whereFullText(['title', 'content'], $search); // Dùng full-text search nếu có
            })
            ->when($sort === 'popular', function ($query) {
                $query->orderByDesc('upvotes_count');
            }, function ($query) {
                $query->orderByDesc('created_at');
            })
            ->paginate((int) $paginate);
    }

    public function formatPosts($posts)
    {
        return collect($posts->items())->map(function ($post) {
            $hasUpvoted = auth()->check() ? $post->upvotes()->where('user_id', auth()->id())->exists() : false;

            return [

                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->getExcerpt(),
                'slug' => $post->slug,
                'upvote_count' => $post->upvotes_count,
                'has_upvoted' => $hasUpvoted,
                'categories' => $post->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'title' => $category->title,
                    ];
                }),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->locale('vi')->diffForHumans(),
                'published_at' => $post->published_at,
            ];
        });
    }
}
