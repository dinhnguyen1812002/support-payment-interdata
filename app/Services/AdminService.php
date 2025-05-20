<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminService
{
    public function getDashboardData(User $currentUser)
    {
        return Cache::remember('admin_dashboard_ '.$currentUser->id, now()->addMinutes(30), function () use ($currentUser) {
            return [
                'posts' => $this->getTopPosts(),
                'totalUsers' => $this->getTotalUsers(),
                'totalPosts' => $this->getTotalPosts(),
                'user' => [
                    'name' => $currentUser->name,
                    'email' => $currentUser->email,
                    'profile_photo_path' => $currentUser->profile_photo_path,
                ],
            ];
        });

    }

    private function getTopPosts(): array
    {
        return Post::select('id', 'title', 'is_published', 'user_id')
            ->with('user:id,name,email,profile_photo_path')
            ->withCount(['upvotes', 'comments'])
            ->orderByDesc('upvotes_count')
            ->limit(5)
            ->get()
            ->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'status' => $post->is_published,
                'vote' => (string) $post->upvotes_count,
                'comment' => $post->comments_count,
                'user' => [
                    'name' => $post->user->name,
                    'email' => $post->user->email,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
            ])->toArray();
    }

    private function getTotalUsers(): int
    {
        return Cache::remember('total_users_count', now()->addHour(), fn () => User::count());
    }

    private function getTotalPosts(): int
    {
        return Cache::remember('total_posts_count', now()->addHour(), fn () => Post::count());
    }

    public function getAllPosts(Request $request, int $perPage = 10): array
    {
        $posts = $this->fetchPaginatedPosts($request, $perPage);

        return [
            'data' => $this->transformPosts($posts),
            'pagination' => $this->formatPagination($posts),
        ];
    }

    private function fetchPaginatedPosts(Request $request, int $perPage): LengthAwarePaginator
    {
        $query = Post::with(['user:id,name,profile_photo_path,email'])
            ->withCount(['upvotes', 'comments']);

        // Apply filters if provided
        if ($request->has('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        if ($request->has('status')) {
            $isPublished = $request->status === 'published';
            $query->where('is_published', $isPublished);
        }

        if ($request->has('sort') && $request->has('direction')) {
            $query->orderBy($request->sort, $request->direction);
        } else {
            $query->latest();
        }

        return $query->paginate($perPage)->withQueryString();
    }

    private function transformPosts(LengthAwarePaginator $posts): array
    {
        return $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'status' => $post->is_published ? 'published' : 'private',
                'votes' => $post->upvotes_count,
                'comments' => $post->comments_count,
                'createdAt' => $post->created_at->toISOString(),
                'updatedAt' => $post->updated_at->toISOString(),
                'user' => $this->formatUser($post->user),
            ];
        })->values()->all();
    }

    private function formatUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatarUrl' => $user->profile_photo_path
                ? asset('storage/'.$user->profile_photo_path)
                : $this->getDefaultAvatarUrl($user->name),
        ];
    }

    private function getDefaultAvatarUrl(string $name): string
    {
        return 'https://ui-avatars.com/api/?name='.urlencode($name).'&color=7F9CF5&background=EBF4FF';
    }

    private function formatPagination(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
        ];
    }
}
