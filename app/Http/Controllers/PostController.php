<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Events\NewQuestionCreated;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewPostNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');

        $posts = Post::getPosts($search, 6, $sort);

        $totalComment = Post::withCount('comments')->count();
        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        $user = auth()->user();
        $notifications = $user ? $user->unreadNotifications : [];

        return Inertia::render('Posts/Index', [
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
            'totalComment' => $totalComment,
            'categories' => $categories,
            'postCount' => $posts->total(),
            'upvotes_count' => $posts->total(),
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
        ]);
    }

    public function create()
    {
        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        return Inertia::render('Posts/Create', [
            'categories' => $categories,
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ]);
    }

    public function store(CreatePostData $postData)
    {
        $slug = Str::slug($postData->title);

        if (Post::existsByTitleOrSlug($postData->title, $slug)) {
            return redirect()->back()->withErrors([
                'title' => 'Tiêu đề hoặc đường dẫn (slug) đã tồn tại. Vui lòng chọn tiêu đề khác.',
            ])->withInput();
        }

        $post = Post::create([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $slug,
            'is_published' => $postData->is_published,
            'user_id' => auth()->id(),
        ]);

        if (! empty($postData->categories)) {
            $post->categories()->attach($postData->categories);
        }
        $users = User::all();
        foreach ($users as $user) {
            $user->notify(new NewPostNotification($post));
        }

        broadcast(new NewQuestionCreated($post))->toOthers();

        return redirect()->route('/')->with('success', 'Post created successfully!');
    }

    public function show($slug)
    {
        $post = Post::getPostBySlug($slug);
        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        $comments = $post->getFormattedComments();
        $hasUpvoted = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        return Inertia::render('Posts/PostDetail', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'created_at' => $post->created_at->diffForHumans(),
                'updated_at' => $post->updated_at,
                'published_at' => $post->published_at,
                'user' => $post->user,
                'categories' => $post->categories,
                'comments' => $comments,
                'upvotes_count' => $post->upvotes_count,
                'has_upvoted' => $hasUpvoted,
            ],
            'categories' => $categories,
            //            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ]);
    }

    public function edit($slug)
    {
        $post = Post::where('slug', $slug)->with('user', 'categories')->firstOrFail();

        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        return Inertia::render('Posts/EditPost', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'is_published' => $post->is_published,
                'categories' => $post->categories->pluck('id'),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->toDateTimeString(),
                'updated_at' => $post->updated_at->toDateTimeString(),
            ],
            'categories' => $categories,
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ]);
    }

    public function update(CreatePostData $request, Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        $postData = CreatePostData::from($request);

        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
        ]);

        if (! empty($postData->categories)) {
            $post->categories()->sync($postData->categories);
        }

        return redirect()->back()->with('success', 'Post updated successfully!');
    }

    public function destroy(Post $post)
    {
        //        if (! Gate::allows('delete', $post)) {
        // //            return back()->with('error', 'Bạn không có quyền xóa bài viết này!');
        // //        }

        $post->delete();

        return back()->with('success', 'Bài viết đã được xóa thành công!');
    }

    public function filterPostByCategory(Request $request, $categorySlug)
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();
        $posts = Post::byCategorySlug($categorySlug)
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->latest()
            ->paginate(6);

        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        return Inertia::render('Posts/Category', [
            'category' => [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
            ],
            'categories' => $categories,
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
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

    public function search(Request $request)
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');

        // Tìm kiếm ID các bài viết phù hợp
        $postIds = Post::search($search)->keys();

        // Truy vấn thực tế từ database với điều kiện ID
        $posts = Post::whereIn('id', $postIds)
            ->with(['user', 'categories']) // Eager load relationships
            ->withCount('upvotes')
            ->when($sort === 'latest', fn ($q) => $q->latest())
            ->when($sort === 'upvotes', fn ($q) => $q->orderBy('upvotes_count', 'desc'))
            ->paginate(10)
            ->withQueryString();

        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        $user = auth()->user();
        $notifications = $user ? $user->unreadNotifications : [];

        return Inertia::render('Posts/Search', [
            'posts' => $posts->map(fn ($post) => $post->toFormattedArray()),
            'categories' => $categories,
            'postCount' => $posts->total(),
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
        ]);
    }

    public function getLatestPosts(Request $request)
    {
        return response()->json(
            Post::select(['id', 'title', 'slug'])
                ->withCount('upvotes')
                ->orderBy('upvotes_count', 'desc')
                ->latest()
                ->limit(5)
                ->get()
        );
    }

    public function getCountPost()
    {
        $user = Auth::user();
        if ($user && $user->hasRole('admin')) {
            $postCount = Post::count();
        } else {
            $postCount = Post::where('is_published', true)->count();
        }

        return response()->json($postCount);
    }

    public function topVotedPosts(Request $request)
    {
        $limit = $request->query('limit', 5);

        $posts = Post::with(['user:id,name,profile_photo_path'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->take($limit)
            ->get();

        return response()->json([
            'data' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'name' => $post->user->name,
                    'title' => $post->title,
                    'status' => $post->is_published ? 'private' : 'public',
                    'vote' => $post->upvotes_count,
                    'comment' => $post->comments()->count(),
                    'user' => [
                        'name' => $post->user->name,
                        'profile_photo_path' => $post->user->profile_photo_path,
                        'email' => $post->user->email,
                    ],
                ];
            }),
        ]);
    }
}
