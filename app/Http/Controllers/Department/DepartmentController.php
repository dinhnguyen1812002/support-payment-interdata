<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Post;
use App\Models\User;
use App\Services\PostService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;

class DepartmentController extends Controller
{
    use AuthorizesRequests;

    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request)
    {
        // Kiểm tra vai trò admin
        // if (! auth()->user()->hasRole('admin') || ! auth()->user()->hasRole('employee') ) {
        //     throw UnauthorizedException::forRoles(['admin']);
        // }
        
        $search = $request->input('search', '');

        $departments = Departments::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Departments/Index', [
            'departments' => [
                'data' => $departments->items(),
                'total' => $departments->total(),
                'per_page' => $departments->perPage(),
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'next_page_url' => $departments->nextPageUrl(),
                'prev_page_url' => $departments->previousPageUrl(),
            ],
            'keyword' => $search,
        ]);
    }

    // public function create()
    // {
    //     if (! auth()->user()->hasRole('admin')) {
    //         throw UnauthorizedException::forRoles(['admin']);
    //     }

    //     return Inertia::render('Departments/Create');
    // }

    public function store(Request $request)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',

        ]);

        Departments::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('departments.index')->with('success', 'Department created successfully.');
    }

    public function show(string $slug)
    {

        $department = Departments::where('slug', $slug)->firstOrFail();
        $user = auth()->user();

        // Kiểm tra quyền truy cập:
        // 1. Admin có thể xem tất cả phòng ban
        // 2. Người dùng chỉ có thể xem phòng ban mà họ thuộc về
        if (! $user->hasRole('admin') && ! $user->departments()->where('departments.id', $department->id)->exists()) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Get notifications for the current user
        $notifications = auth()->user()->unreadNotifications;

        // Get all tickets/posts belonging to this department
        $posts = Post::where('department_id', $department->id)
            ->with(['user', 'categories', 'tags', 'assignee', 'department'])
            ->withCount('upvotes')
            ->withCount('comments')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($post) {
                // Get paginated comments
                $comments = $post->comments()
                    ->whereNull('parent_id')
                    ->with([
                        'user.roles',
                        'user.departments',
                        'replies.user.roles',
                        'replies.user.departments',
                    ])
                    ->latest()
                    ->paginate(5);

                $commentsData = [
                    'data' => $comments->items(),
                    'next_page_url' => $comments->nextPageUrl(),
                    'prev_page_url' => $comments->previousPageUrl(),
                    'current_page' => $comments->currentPage(),
                    'last_page' => $comments->lastPage(),
                    'per_page' => $comments->perPage(),
                    'total' => $comments->total(),
                    'from' => $comments->firstItem(),
                    'to' => $comments->lastItem(),
                ];

                $hasUpvoted = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'status' => $post->status,
                    'priority' => $post->priority,
                    'created_at' => $post->created_at->diffForHumans(),
                    'updated_at' => $post->updated_at,
                    'published_at' => $post->published_at,
                    'user' => $post->user,
                    'assignee' => $post->assignee,
                    'department' => $post->department,
                    'categories' => $post->categories,
                    'tags' => $post->tags,
                    'comments' => $commentsData,
                    'upvote_count' => $post->upvotes_count,
                    'has_upvote' => $hasUpvoted,
                    'product_name' => $post->product_name,
                ];
            });

        return Inertia::render('Departments/Show', [
            'department' => $department,
            'notifications' => $notifications,
            'posts' => $posts,
        ]);
    }

    public function edit(Departments $department)
    {

        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        return Inertia::render('Departments/Edit', [
            'department' => $department,
        ]);
    }

    public function update(Request $request, Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,'.$department->id,
            'description' => 'nullable|string',
        ]);

        $department->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $department->delete();

        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }

    public function getPostBySlug(string $slug)
    {
        $post = Post::getPostBySlug($slug);
        $data = $this->postService->preparePostData($post);

        return Inertia::render('Departments/Show', $data);
    }

    /**
     * @throws AuthorizationException
     */
    public function getAvailableUsers(Departments $department)
    {
        // Kiểm tra quyền
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Chỉ lấy danh sách người dùng chưa thuộc phòng ban nào
        $users = User::whereDoesntHave('departments')
            ->select(['id', 'name', 'email'])
            ->get();

        return response()->json($users);
    }

    public function getEmployee(string $slug)
    {

        // Lấy thông tin phòng ban
        $department = Departments::where('slug', $slug)->firstOrFail();
        $user = auth()->user();

        // Kiểm tra quyền xem danh sách nhân viên:
        // 1. Admin có thể xem tất cả phòng ban
        // 2. Người dùng chỉ có thể xem phòng ban mà họ thuộc về
        if (! $user->hasRole('admin') && ! $user->departments()->where('departments.id', $department->id)->exists()) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Lấy nhân sự trong phòng ban với phân trang
        $users = User::whereHas('departments', function ($query) use ($department) {
            $query->where('departments.id', $department->id);
        })
            ->with('roles')
            ->paginate(10)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo_path' => $user->profile_photo_path,
                    'roles' => $user->roles->pluck('name')->implode(', '), // trả về chuỗi role
                ];
            });

        return Inertia::render('Departments/Employee', [
            'users' => $users,
            'department' => $department,
        ]);
    }

    public function addUser(Request $request, Departments $department)
    {
        // Kiểm tra quyền
        //        $this->authorize('add users to department', $department);
        //        $this->hasRole('admin');
        if (! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('department_manager')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Kiểm tra xem user đã thuộc phòng ban khác chưa
          if (! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('department_manager')) {
            throw UnauthorizedException::forRoles(['admin']);
        }


        // Thêm user vào phòng ban
        $department->users()->attach($user->id);

        // Gán vai trò Employee nếu chưa có vai trò
        if (! $user->hasAnyRole(['admin', 'department_manager', 'employee'])) {
            $user->assignRole('employee');
        }

        return redirect()->route('departments.employees', ['slug' => $department->slug])->with('success', 'User added to department');
    }

    public function removeUser(Request $request, Departments $department, User $user)
    {
        //        if (! auth()->user()->hasRole('admin')) {
        //            throw UnauthorizedException::forRoles(['admin']);
        //        }
        $this->authorize('remove-users-from-department', $department);

        // Kiểm tra xem user có thuộc phòng ban này không
        if (! $user->departments()->where('departments.id', $department->id)->exists()) {
            return response()->json(['error' => 'User does not belong to this department'], 422);
        }

        // Không cho phép xóa chính mình khỏi phòng ban
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'You cannot remove yourself from the department'], 422);
        }

        // Không cho phép xóa Admin khỏi phòng ban
        if ($user->hasRole('admin')) {
            return response()->json(['error' => 'Cannot remove Admin users from department'], 422);
        }

        // Xóa user khỏi phòng ban
        $department->users()->detach($user->id);

        return redirect()->back()->with('success', 'User removed from department');
    }
}
