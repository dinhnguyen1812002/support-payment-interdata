<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Post;
use App\Models\User;
use App\Services\PostService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;

class DepartmentController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request)
    {
        // Kiểm tra vai trò admin
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

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

    public function create()
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        return Inertia::render('Departments/Create');
    }

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

        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Get notifications for the current user
        $notifications = auth()->user()->unreadNotifications;

        // Get posts related to notifications
        $postIds = collect($notifications)->pluck('data.post_id')->filter()->unique()->values()->toArray();
        $posts = Post::whereIn('id', $postIds)
            ->with(['user', 'categories', 'tags'])
            ->withCount('upvotes')
            ->withCount('comments')
            ->get()
            ->map(function ($post) {
                $comments = $post->getFormattedComments();
                $hasUpvoted = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'created_at' => $post->created_at->diffForHumans(),
                    'updated_at' => $post->updated_at,
                    'published_at' => $post->published_at,
                    'user' => $post->user,
                    'categories' => $post->categories,
                    'tags' => $post->tags,
                    'comments' => $comments,
                    'upvotes_count' => $post->upvotes_count,
                    'has_upvoted' => $hasUpvoted,
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

    public function addUser(Request $request, Departments $department)
    {
        // Kiểm tra quyền
        $this->authorize('add users to department', $department);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Kiểm tra xem user đã thuộc phòng ban khác chưa
        if ($user->department_id && $user->department_id !== $department->id) {

            return response()->json(['error' => 'User already belongs to another department'], 422);

        }

        $user->department_id = $department->id;

        $user->save();

        // Gán vai trò Employee nếu chưa có vai trò
        if (! $user->hasAnyRole(['Admin', 'Department Manager', 'Employee'])) {
            $user->assignRole('Employee');
        }

        return response()->json(['success' => true, 'message' => 'User added to department']);
    }

    public function getEmployee()
    {
        $user =  User::take(6)->get();
        return Inertia::render('Departments/Employee', [
            'user'=> $user
        ]);
    }
//    public function showuser(Departments $department)
//    {
//
//        return inertia('Departments/Employee', [
//            'department' => $department,
//            'departments' => Departments::select('id', 'name')->get(),
//            'auth' => [
//                'user' => auth()->user(),
//            ],
//        ]);
//    }
}
