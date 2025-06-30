<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminService
{
    public function getDashboardData(User $currentUser)
    {
        // return Cache::remember('admin_dashboard_ '.$currentUser->id, now()->addMinutes(30), function () use ($currentUser) {
           
        // });
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

    }

    public function getTopPosts(): array
    {
        return Post::with([
            'user:id,name,profile_photo_path,email', 
            'categories:id,title',
            'assignee:id,name,profile_photo_path,email',
            'department:id,name'
        ])
        ->withCount(['upvotes', 'comments'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'status' => $post->status,
                'priority' => $post->priority,
                'created_at' => $post->created_at->format('d/m/Y'),
                'user' => $post->user,
                'categories' => $post->categories,
                'upvotes_count' => $post->upvotes_count,
                'comments_count' => $post->comments_count,
                'assignee' => $post->assignee,
                'department' => $post->department
            ];
        })
        ->toArray(); // Add this to convert the Collection to an array
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
        $startTime = microtime(true);
        $requestId = uniqid('req_');
        
        try {
            // Log the request for debugging
            \Log::info("Post listing request started", [
                'request_id' => $requestId,
                'user_id' => auth()->id(),
                'url' => $request->fullUrl(),
                'per_page' => $perPage
            ]);
            
            // Use configuration values
            $lockEnabled = config('pagination.lock.enabled', true);
            $lockTimeout = config('pagination.lock.timeout', 10);
            $waitTimeout = config('pagination.lock.wait_timeout', 5);
            $cacheEnabled = config('pagination.cache.enabled', true);

            if (!$lockEnabled) {
                return $this->fetchPostsData($request, $perPage, $startTime, false, $requestId);
            }

            // Add mutex lock to prevent concurrent pagination conflicts
            $lockKey = config('pagination.cache.prefix', 'pagination').'_admin_posts_'.auth()->id().'_'.md5($request->fullUrl());

            return \Cache::lock($lockKey, $lockTimeout)->block($waitTimeout, function () use ($request, $perPage, $startTime, $requestId) {
                return $this->fetchPostsData($request, $perPage, $startTime, false, $requestId);
            });

        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            \Log::warning('Pagination request timeout', [
                'request_id' => $requestId,
                'user_id' => auth()->id(),
                'url' => $request->fullUrl(),
                'execution_time' => (microtime(true) - $startTime) * 1000,
            ]);

            // Fallback without lock
            return $this->fetchPostsData($request, $perPage, $startTime, true, $requestId);
        } catch (\Exception $e) {
            \Log::error('Error fetching posts data', [
                'request_id' => $requestId,
                'user_id' => auth()->id(),
                'url' => $request->fullUrl(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return empty data structure with error flag
            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                    'links' => []
                ],
                'filters' => $this->getCurrentFilters($request),
                'error' => 'An error occurred while fetching data'
            ];
        }
    }

    private function fetchPostsData(Request $request, int $perPage, float $startTime, bool $isTimeout = false, string $requestId = ''): array
    {
        try {
            $cacheEnabled = config('pagination.cache.enabled', true);
            $cacheTtl = config('pagination.cache.ttl', 300);

            if ($cacheEnabled && !$isTimeout) {
                $cacheKey = config('pagination.cache.prefix', 'pagination').'_posts_'.md5($request->fullUrl());

                $data = \Cache::remember($cacheKey, $cacheTtl, function () use ($request, $perPage, $requestId) {
                    \Log::info("Fetching fresh posts data for cache", ['request_id' => $requestId]);
                    $posts = $this->fetchPaginatedPosts($request, $perPage);

                    return [
                        'data' => $this->transformPosts($posts),
                        'pagination' => $this->formatPagination($posts),
                        'filters' => $this->getCurrentFilters($request),
                    ];
                });
            } else {
                \Log::info("Fetching posts data directly (cache disabled or timeout)", ['request_id' => $requestId]);
                $posts = $this->fetchPaginatedPosts($request, $perPage);

                $data = [
                    'data' => $this->transformPosts($posts),
                    'pagination' => $this->formatPagination($posts),
                    'filters' => $this->getCurrentFilters($request),
                ];
            }

            // Validate data structure before returning
            if (!isset($data['data']) || !is_array($data['data'])) {
                \Log::warning("Invalid data structure detected", [
                    'request_id' => $requestId,
                    'data_keys' => array_keys($data)
                ]);
                $data['data'] = [];
            }

            if (!isset($data['pagination']) || !is_array($data['pagination'])) {
                \Log::warning("Invalid pagination structure detected", [
                    'request_id' => $requestId
                ]);
                $data['pagination'] = [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => count($data['data'] ?? []),
                    'from' => 1,
                    'to' => count($data['data'] ?? []),
                    'links' => []
                ];
            }

            \Log::info("Posts data fetched successfully", [
                'request_id' => $requestId,
                'execution_time' => (microtime(true) - $startTime) * 1000,
                'record_count' => count($data['data'] ?? [])
            ]);

            return $data;
        } catch (\Exception $e) {
            \Log::error("Exception in fetchPostsData", [
                'request_id' => $requestId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    private function fetchPaginatedPosts(Request $request, int $perPage): LengthAwarePaginator
    {
        $query = Post::with([
            'user:id,name,profile_photo_path,email', 
            'categories:id,title',
            'assignee:id,name,profile_photo_path,email',
            'department:id,name'
        ])
        ->withCount(['upvotes', 'comments']);

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%'.$searchTerm.'%')
                    ->orWhere('content', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', '%'.$searchTerm.'%');
                    });
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'private') {
                $query->where('is_published', false);
            }
            // 'all' không cần filter gì
        }

        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Validate sort fields
        $allowedSortFields = ['title', 'created_at', 'updated_at', 'upvotes_count', 'comments_count'];
        if (in_array($sortField, $allowedSortFields)) {
            if (in_array($sortField, ['upvotes_count', 'comments_count'])) {
                $query->orderBy($sortField, $sortDirection);
            } else {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            $query->latest();
        }

        return $query->paginate($perPage)->withQueryString();
    }

    private function getCurrentFilters(Request $request): array
    {
        return [
            'search' => $request->get('search', ''),
            'status' => $request->get('status', 'all'),
            'date_from' => $request->get('date_from', ''),
            'date_to' => $request->get('date_to', ''),
            'sort' => $request->get('sort', 'created_at'),
            'direction' => $request->get('direction', 'desc'),
        ];
    }

    private function transformPosts(LengthAwarePaginator $posts): array
    {
        return $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'status' => $post->status,
                'created_at' => $post->created_at,
                'user' => $post->user,
                'categories' => $post->categories,
                'upvotes_count' => $post->upvotes_count,
                'comments_count' => $post->comments_count,
                'assignee' => $post->assignee,
                'department' => $post->department
            ];
        })->toArray();
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
        try {
            return [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'next_page_url' => $paginator->nextPageUrl(),
                'prev_page_url' => $paginator->previousPageUrl(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
                'links' => $this->generatePaginationLinks($paginator),
            ];
        } catch (\Exception $e) {
            \Log::error("Error formatting pagination", [
                'message' => $e->getMessage()
            ]);
            
            // Return a safe default structure
            return [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'next_page_url' => null,
                'prev_page_url' => null,
                'from' => 0,
                'to' => 0,
                'links' => [],
            ];
        }
    }

    private function generatePaginationLinks(LengthAwarePaginator $paginator): array
    {
        $links = [];
        $currentPage = $paginator->currentPage();
        $lastPage = $paginator->lastPage();

        // Tạo các link phân trang với logic hiển thị thông minh
        $start = max(1, $currentPage - 2);
        $end = min($lastPage, $currentPage + 2);

        // Đảm bảo luôn hiển thị ít nhất 5 trang nếu có thể
        if ($end - $start < 4) {
            if ($start == 1) {
                $end = min($lastPage, $start + 4);
            } else {
                $start = max(1, $end - 4);
            }
        }

        for ($i = $start; $i <= $end; $i++) {
            $links[] = [
                'page' => $i,
                'url' => $paginator->url($i),
                'active' => $i === $currentPage,
            ];
        }

        return $links;
    }

    public function getAllTags(Request $request, mixed $perPage)
    {
        $tags = Tag::all();

        return [
            'tags' => $tags,
        ];
    }

    public function getAllUsers(Request $request, int $perPage = 10): array
    {
        $query = User::query();

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%'.$searchTerm.'%')
                    ->orWhere('email', 'like', '%'.$searchTerm.'%');
            });
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = ['name', 'email', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->latest();
        }

        $users = $query->paginate($perPage)->withQueryString();

        return [
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'profile_photo_path' => $user->profile_photo_path,
                ];
            })->values()->all(),
            'pagination' => $this->formatPagination($users),
        ];
    }
}









