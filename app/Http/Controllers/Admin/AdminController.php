<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Services\AdminService;
use App\Services\CategoryService;
use App\Services\TicketAutomationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    use AuthorizesRequests;

    protected AdminService $adminService;

    protected CategoryService $categoryService;

    protected TicketAutomationService $automationService;

    public function __construct(AdminService $AdminService,
                                CategoryService $categoryService,
                                TicketAutomationService $automationService
                                )
    {
        $this->adminService = $AdminService;
        $this->categoryService = $categoryService;
        $this->automationService = $automationService;
    }

    public function dashboard()
    {
        $this->authorize('view admin dashboard');

        $data = $this->adminService->getDashboardData(auth()->user());
        // $data['posts'] = $this->adminService->getTopPosts();
        // Add automation stats to dashboard
        $data['automation_stats'] = $this->automationService->getAutomationStats();

        return Inertia::render('Admin/Dashboard', $data);

    }

    public function getAllPost(Request $request)
    {

        $this->authorize('view posts');
       
        $perPage = $request->get('per_page', 10);
        $postData = $this->adminService->getAllPosts($request, $perPage);

        return Inertia::render('Admin/Post', $postData);

    }

    public function getAllCategory(Request $request)
    {
        $this->authorize('view admin dashboard');

        $perPage = $request->input('per_page', 10);
        $categoryData = $this->categoryService->getAllCategorise($request, $perPage);

        return Inertia::render('Admin/Categories', $categoryData);
    }

    public function getAllUsers(Request $request)
    {
        $this->authorize('view admin dashboard');

        $perPage = $request->input('per_page', 10);
        $users = $this->adminService->getAllUsers($request, $perPage);

        return Inertia::render('Admin/Users', $users);
    }

    public function getAllTags(Request $request)
    {
        $this->authorize('view admin dashboard');

        $currentUser = auth()->user();

        if ($currentUser->isAdmin()) {
            // Admin xem tất cả tags
            $tags = Tag::all();
        } else {
            // Non-admin chỉ xem tags của posts trong phòng ban họ
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $tags = Tag::whereHas('posts', function($query) use ($departmentIds) {
                    $query->whereIn('department_id', $departmentIds);
                })->get();
            } else {
                $tags = collect(); // Empty collection if user has no department
            }
        }

        return Inertia::render('Admin/Tags', [
            'tags' => $tags,
        ]);
    }

    public function getAllRolesAndPermissions(Request $request)
    {
        $this->authorize('view admin dashboard');

        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $page = $request->input('page', 1);
        $roles = \Spatie\Permission\Models\Role::with('permissions')->get();
        $permissions = \Spatie\Permission\Models\Permission::all();

        // Phân trang cho users
        $usersQuery = \App\Models\User::query()
            ->with(['roles', 'permissions']);

        // Lọc theo phòng ban nếu user không phải admin
        $currentUser = auth()->user();
        if (!$currentUser->isAdmin()) {
            $departmentIds = $currentUser->departments()->pluck('departments.id');
            if ($departmentIds->isNotEmpty()) {
                $usersQuery->whereHas('departments', function($q) use ($departmentIds) {
                    $q->whereIn('departments.id', $departmentIds);
                });
            } else {
                // Nếu user không thuộc phòng ban nào, không hiển thị users nào
                $usersQuery->whereRaw('1 = 0');
            }
        }

        $users = $usersQuery->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/RolesPermissions', [
            'roles' => $roles,
            'permissions' => $permissions,
            'users' => [
                'data' => $users->items(),
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'next_page_url' => $users->nextPageUrl(),
                'prev_page_url' => $users->previousPageUrl(),
            ],
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function notifications()
    {
        $this->authorize('view admin dashboard');

        $user = auth()->user();
        $notifications = $user->notifications()
            ->orderByRaw('read_at IS NULL DESC') // Unread first
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        // Get posts related to these notifications
        $postIds = $notifications->pluck('data.post_id')->filter()->unique()->values()->toArray();
        $posts = [];

        if (! empty($postIds)) {
            $postsQuery = \App\Models\Post::whereIn('id', $postIds)
                ->with(['user', 'categories', 'tags'])
                ->withCount('upvotes');

            // Lọc theo phòng ban nếu user không phải admin
            if (!$user->isAdmin()) {
                $departmentIds = $user->departments()->pluck('departments.id');
                if ($departmentIds->isNotEmpty()) {
                    $postsQuery->whereIn('department_id', $departmentIds);
                } else {
                    // Nếu user không thuộc phòng ban nào, không hiển thị posts nào
                    $postsQuery->whereRaw('1 = 0');
                }
            }

            $posts = $postsQuery->get()
                ->map(function ($post) {
                    $comments = $post->getFormattedComments();
                    $hasUpvote = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'content' => $post->content,
                        'created_at' => $post->created_at->diffForHumans(),
                        'updated_at' => $post->updated_at,
                        'user' => $post->user,
                        'categories' => $post->categories,
                        'tags' => $post->tags,
                        'comments' => $comments,
                        'upvote_count' => $post->upvotes_count,
                        'has_upvote' => $hasUpvote,
                    ];
                });
        }

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
            'posts' => $posts,
        ]);
    }

    public function getPost($id)
    {
        $this->authorize('view admin dashboard');

        $post = \App\Models\Post::with(['user', 'categories', 'tags'])
            ->withCount('upvotes')
            ->findOrFail($id);

        $comments = $post->getFormattedComments();
        $hasUpvote = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        return response()->json([
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'created_at' => $post->created_at->diffForHumans(),
                'updated_at' => $post->updated_at,
                'user' => $post->user,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'comments' => $comments,
                'upvote_count' => $post->upvotes_count,
                'has_upvote' => $hasUpvote,
            ],
        ]);
    }

    /**
     * Get departments and users for ticket assignment
     */
    public function getAssignmentData()
    {
        $this->authorize('view admin dashboard');

        $departments = \App\Models\Departments::select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $users = \App\Models\User::select(['id', 'name', 'email', 'profile_photo_path'])
            ->with(['departments:id,name'])
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'support', 'staff']);
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'departments' => $departments,
            'users' => $users,
        ]);
    }
}
