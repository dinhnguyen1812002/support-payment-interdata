<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminService
{
    // Cache keys và thời gian
    private const CACHE_TTL_HOUR = 3600; // 1 hour
    private const CACHE_TTL_30MIN = 1800; // 30 minutes
    private const CACHE_TTL_5MIN = 300; // 5 minutes

    // Pagination config
    private const DEFAULT_PER_PAGE = 10;
    private const PAGINATION_LOCK_TIMEOUT = 10;
    private const PAGINATION_WAIT_TIMEOUT = 5;

    /**
     * Lấy dữ liệu dashboard cho admin
     */
    public function getDashboardData(User $currentUser): array
    {
        return [
            'posts' => $this->getTopPosts($currentUser),
            'totalUsers' => $this->getTotalUsers($currentUser),
            'totalPosts' => $this->getTotalPosts($currentUser),
            'user' => $this->formatCurrentUser($currentUser),
        ];
    }

    /**
     * Lấy top 10 posts mới nhất
     */
    public function getTopPosts(User $currentUser = null): array
    {
        $query = Post::with($this->getPostRelations())
            ->withCount(['upvotes', 'comments']);

        // Nếu user không phải admin, chỉ lấy posts của phòng ban họ
        if ($currentUser && !$currentUser->isAdmin()) {
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $query->whereIn('department_id', $departmentIds);
            } else {
                // Nếu user không thuộc phòng ban nào, không hiển thị posts nào
                $query->whereRaw('1 = 0');
            }
        }

        return $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($post) {
                return $this->transformPost($post);
            })
            ->toArray();
    }

    /**
     * Lấy tất cả posts với phân trang và filter
     */
    public function getAllPosts(Request $request, int $perPage = self::DEFAULT_PER_PAGE): array
    {
        $requestId = uniqid('req_');
        $startTime = microtime(true);

        try {
            $this->logRequest($requestId, $request, $perPage);

            if (!$this->isLockEnabled()) {
                return $this->fetchPostsData($request, $perPage, $startTime, false, $requestId);
            }

            return $this->executeWithLock($request, $perPage, $startTime, $requestId);

        } catch (\Exception $e) {
            return $this->handlePostsError($e, $request, $perPage, $requestId);
        }
    }

    /**
     * Lấy tất cả tags
     */
    public function getAllTags(Request $request, mixed $perPage): array
    {
        $currentUser = auth()->user();

        if ($currentUser && $currentUser->isAdmin()) {
            // Admin xem tất cả tags
            $tags = Tag::all();
        } else {
            // Non-admin chỉ xem tags của posts trong phòng ban họ
            $departmentIds = $currentUser ? $currentUser->departments()->pluck('departments.id') : collect();
            if ($departmentIds->isNotEmpty()) {
                $tags = Tag::whereHas('posts', function($query) use ($departmentIds) {
                    $query->whereIn('department_id', $departmentIds);
                })->get();
            } else {
                $tags = collect(); // Empty collection if user has no department
            }
        }

        return [
            'tags' => $tags,
        ];
    }

    /**
     * Lấy tất cả users với phân trang
     */
    public function getAllUsers(Request $request, int $perPage = self::DEFAULT_PER_PAGE): array
    {
        $query = User::query();

        // Lọc theo phòng ban nếu user không phải admin
        $currentUser = auth()->user();
        if ($currentUser && !$currentUser->isAdmin()) {
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $query->whereHas('departments', function($q) use ($departmentIds) {
                    $q->whereIn('departments.id', $departmentIds);
                });
            } else {
                // Nếu user không thuộc phòng ban nào, không hiển thị users nào
                $query->whereRaw('1 = 0');
            }
        }

        $this->applyUserFilters($query, $request);
        $this->applyUserSorting($query, $request);

        $users = $query->paginate($perPage)->withQueryString();

        return [
            'data' => $users->map(function ($user) {
                return $this->transformUser($user);
            })->values()->all(),
            'pagination' => $this->formatPagination($users),
        ];
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Lấy relations cần thiết cho Post
     */
    private function getPostRelations(): array
    {
        return [
            'user:id,name,profile_photo_path,email',
            'categories:id,title',
            'assignee:id,name,profile_photo_path,email',
            'department:id,name',
        ];
    }

    /**
     * Format thông tin user hiện tại
     */
    private function formatCurrentUser(User $user): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo_path' => $user->profile_photo_path,
        ];
    }

    /**
     * Lấy tổng số users với cache
     */
    private function getTotalUsers(User $currentUser = null): int
    {
        if ($currentUser && !$currentUser->isAdmin()) {
            // Nếu không phải admin, đếm users trong cùng phòng ban
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $cacheKey = 'total_users_count_dept_' . $departmentIds->implode('_');
                return Cache::remember($cacheKey, self::CACHE_TTL_HOUR, function() use ($departmentIds) {
                    return User::whereHas('departments', function($query) use ($departmentIds) {
                        $query->whereIn('departments.id', $departmentIds);
                    })->count();
                });
            }
            return 0;
        }

        return Cache::remember('total_users_count', self::CACHE_TTL_HOUR,
            fn() => User::count()
        );
    }

    /**
     * Lấy tổng số posts với cache
     */
    private function getTotalPosts(User $currentUser = null): int
    {
        if ($currentUser && !$currentUser->isAdmin()) {
            // Nếu không phải admin, đếm posts trong cùng phòng ban
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $cacheKey = 'total_posts_count_dept_' . $departmentIds->implode('_');
                return Cache::remember($cacheKey, self::CACHE_TTL_HOUR, function() use ($departmentIds) {
                    return Post::whereIn('department_id', $departmentIds)->count();
                });
            }
            return 0;
        }

        return Cache::remember('total_posts_count', self::CACHE_TTL_HOUR,
            fn() => Post::count()
        );
    }

    /**
     * Transform Post model thành array
     */
    private function transformPost($post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'status' => $post->status,
            'priority' => $post->priority ?? null,
            'created_at' => $post->created_at->format('d/m/Y'),
            'user' => $post->user,
            'categories' => $post->categories,
            'upvotes_count' => $post->upvotes_count,
            'comments_count' => $post->comments_count,
            'assignee' => $post->assignee,
            'department' => $post->department,
        ];
    }

    /**
     * Transform User model thành array
     */
    private function transformUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at->format('d/m/Y'),
            'updated_at' => $user->updated_at->toISOString(),
            'profile_photo_path' => $user->profile_photo_url,
        ];
    }

    /**
     * Kiểm tra lock có được bật không
     */
    private function isLockEnabled(): bool
    {
        return config('pagination.lock.enabled', true);
    }

    /**
     * Log request để debug
     */
    private function logRequest(string $requestId, Request $request, int $perPage): void
    {
        Log::info('Post listing request started', [
            'request_id' => $requestId,
            'user_id' => auth()->id(),
            'url' => $request->fullUrl(),
            'per_page' => $perPage,
        ]);
    }

    /**
     * Thực thi với lock để tránh conflict
     */
    private function executeWithLock(Request $request, int $perPage, float $startTime, string $requestId): array
    {
        $lockKey = $this->generateLockKey($request);

        try {
            return Cache::lock($lockKey, self::PAGINATION_LOCK_TIMEOUT)
                ->block(self::PAGINATION_WAIT_TIMEOUT, function () use ($request, $perPage, $startTime, $requestId) {
                    return $this->fetchPostsData($request, $perPage, $startTime, false, $requestId);
                });
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            $this->logLockTimeout($requestId, $request, $startTime);
            return $this->fetchPostsData($request, $perPage, $startTime, true, $requestId);
        }
    }

    /**
     * Generate lock key duy nhất
     */
    private function generateLockKey(Request $request): string
    {
        $prefix = config('pagination.cache.prefix', 'pagination');
        $currentUser = auth()->user();
        $userKey = $currentUser && !$currentUser->isAdmin() ?
            '_dept_' . $currentUser->departments()->pluck('departments.id')->implode('_') :
            '_admin';
        return $prefix . '_admin_posts_' . auth()->id() . '_' . md5($request->fullUrl()) . $userKey;
    }

    /**
     * Log khi lock timeout
     */
    private function logLockTimeout(string $requestId, Request $request, float $startTime): void
    {
        Log::warning('Pagination request timeout', [
            'request_id' => $requestId,
            'user_id' => auth()->id(),
            'url' => $request->fullUrl(),
            'execution_time' => (microtime(true) - $startTime) * 1000,
        ]);
    }

    /**
     * Handle error khi fetch posts
     */
    private function handlePostsError(\Exception $e, Request $request, int $perPage, string $requestId): array
    {
        Log::error('Error fetching posts data', [
            'request_id' => $requestId,
            'user_id' => auth()->id(),
            'url' => $request->fullUrl(),
            'error' => $e->getMessage(),
        ]);

        return $this->getEmptyPostsResponse($request, $perPage);
    }

    /**
     * Trả về response rỗng khi có lỗi
     */
    private function getEmptyPostsResponse(Request $request, int $perPage): array
    {
        return [
            'data' => [],
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $perPage,
                'total' => 0,
                'from' => 0,
                'to' => 0,
                'links' => [],
            ],
            'filters' => $this->getCurrentFilters($request),
            'error' => 'An error occurred while fetching data',
        ];
    }

    /**
     * Fetch dữ liệu posts
     */
    private function fetchPostsData(Request $request, int $perPage, float $startTime, bool $isTimeout = false, string $requestId = ''): array
    {
        try {
            $data = $this->getCachedOrFreshData($request, $perPage, $isTimeout, $requestId);
            $this->validateDataStructure($data, $perPage, $requestId);
            $this->logSuccess($requestId, $startTime, $data);

            return $data;
        } catch (\Exception $e) {
            Log::error('Exception in fetchPostsData', [
                'request_id' => $requestId,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Lấy data từ cache hoặc fresh
     */
    private function getCachedOrFreshData(Request $request, int $perPage, bool $isTimeout, string $requestId): array
    {
        $cacheEnabled = config('pagination.cache.enabled', true);

        if ($cacheEnabled && !$isTimeout) {
            $cacheKey = $this->generateCacheKey($request);
            $cacheTtl = config('pagination.cache.ttl', self::CACHE_TTL_5MIN);

            return Cache::remember($cacheKey, $cacheTtl, function () use ($request, $perPage, $requestId) {
                Log::info('Fetching fresh posts data for cache', ['request_id' => $requestId]);
                return $this->buildPostsResponse($request, $perPage);
            });
        }

        Log::info('Fetching posts data directly (cache disabled or timeout)', ['request_id' => $requestId]);
        return $this->buildPostsResponse($request, $perPage);
    }

    /**
     * Generate cache key
     */
    private function generateCacheKey(Request $request): string
    {
        $prefix = config('pagination.cache.prefix', 'pagination');
        $currentUser = auth()->user();
        $userKey = $currentUser && !$currentUser->isAdmin() ?
            '_dept_' . $currentUser->departments()->pluck('departments.id')->implode('_') :
            '_admin';
        return $prefix . '_posts_' . md5($request->fullUrl()) . $userKey;
    }

    /**
     * Build response cho posts
     */
    private function buildPostsResponse(Request $request, int $perPage): array
    {
        $posts = $this->fetchPaginatedPosts($request, $perPage);

        return [
            'data' => $this->transformPostsCollection($posts),
            'pagination' => $this->formatPagination($posts),
            'filters' => $this->getCurrentFilters($request),
        ];
    }

    /**
     * Transform collection posts
     */
    private function transformPostsCollection(LengthAwarePaginator $posts): array
    {
        return $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => $post->title,
                'status' => $post->status,
                'created_at' => $post->created_at->format('d/m/Y'),
                'user' => $post->user,
                'categories' => $post->categories,
                'upvotes_count' => $post->upvotes_count,
                'comments_count' => $post->comments_count,
                'assignee' => $post->assignee,
                'department' => $post->department,
            ];
        })->toArray();
    }

    /**
     * Validate cấu trúc dữ liệu
     */
    private function validateDataStructure(array &$data, int $perPage, string $requestId): void
    {
        if (!isset($data['data']) || !is_array($data['data'])) {
            Log::warning('Invalid data structure detected', [
                'request_id' => $requestId,
                'data_keys' => array_keys($data),
            ]);
            $data['data'] = [];
        }

        if (!isset($data['pagination']) || !is_array($data['pagination'])) {
            Log::warning('Invalid pagination structure detected', ['request_id' => $requestId]);
            $data['pagination'] = $this->getDefaultPagination($perPage, count($data['data'] ?? []));
        }
    }

    /**
     * Lấy pagination mặc định
     */
    private function getDefaultPagination(int $perPage, int $dataCount): array
    {
        return [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => $perPage,
            'total' => $dataCount,
            'from' => 1,
            'to' => $dataCount,
            'links' => [],
        ];
    }

    /**
     * Log success
     */
    private function logSuccess(string $requestId, float $startTime, array $data): void
    {
        Log::info('Posts data fetched successfully', [
            'request_id' => $requestId,
            'execution_time' => (microtime(true) - $startTime) * 1000,
            'record_count' => count($data['data'] ?? []),
        ]);
    }

    /**
     * Fetch posts với pagination
     */
    private function fetchPaginatedPosts(Request $request, int $perPage): LengthAwarePaginator
    {
        $query = Post::with($this->getPostRelations())
            ->withCount(['upvotes', 'comments']);

        // Lọc theo phòng ban nếu user không phải admin
        $currentUser = auth()->user();
        if ($currentUser && !$currentUser->isAdmin()) {
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $query->whereIn('department_id', $departmentIds);
            } else {
                // Nếu user không thuộc phòng ban nào, không hiển thị posts nào
                $query->whereRaw('1 = 0');
            }
        }

        $this->applyPostFilters($query, $request);
        $this->applyPostSorting($query, $request);

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Apply filters cho posts
     */
    private function applyPostFilters($query, Request $request): void
    {
        // Search filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                    ->orWhere('content', 'like', '%' . $searchTerm . '%')
                    ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                        $userQuery->where('name', 'like', '%' . $searchTerm . '%');
                    });
            });
        }

        // Status filter - lọc theo status thật
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
    }

    /**
     * Apply sorting cho posts
     */
    private function applyPostSorting($query, Request $request): void
    {
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = ['title', 'created_at', 'updated_at', 'upvotes_count', 'comments_count', 'priority'];

        if (in_array($sortField, $allowedSortFields)) {
            if ($sortField === 'priority') {
                // Sort by priority with urgent and high first
                $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')");
            } else {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            // Default sorting: priority first, then latest
            $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
                  ->latest();
        }
    }

    /**
     * Apply filters cho users
     */
    private function applyUserFilters($query, Request $request): void
    {
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                    ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }
    }

    /**
     * Apply sorting cho users
     */
    private function applyUserSorting($query, Request $request): void
    {
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = ['name', 'email', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->latest();
        }
    }

    /**
     * Lấy filters hiện tại
     */
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

    /**
     * Format pagination data
     */
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
            Log::error('Error formatting pagination', ['message' => $e->getMessage()]);

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

    /**
     * Generate pagination links
     */
    private function generatePaginationLinks(LengthAwarePaginator $paginator): array
    {
        $links = [];
        $currentPage = $paginator->currentPage();
        $lastPage = $paginator->lastPage();

        // Logic hiển thị thông minh: hiển thị 5 trang quanh current page
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
}