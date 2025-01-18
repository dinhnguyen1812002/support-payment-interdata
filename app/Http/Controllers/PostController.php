<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewQuestionOrAnswerNotification;
use App\Services\PostService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $posts = $this->postService->getPosts($search);
        $formattedPosts = $this->postService->formatPosts($posts);

        // Lấy categories và trả về response giống như trước
        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        return Inertia::render('Posts/Index', [
            'posts' => $formattedPosts,
            'categories' => $categories,
            'postCount' => Post::count(),
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'next_page_url' => $posts->nextPageUrl(),
                'prev_page_url' => $posts->previousPageUrl(),
            ],
            'keyword' => $search,
            'notifications' => ! auth()->user() ? [] : auth()->user()->unreadNotifications,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::getCategoriesCount();

        return Inertia::render('Posts/Create', [
            'categories' => $categories,
            //'category' => Category::getCategoriesCount(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePostData $postData)
    {
        $slug = Str::slug($postData->title);
        // Kiểm tra trùng lặp bài viết
        $existingPost = Post::where('title', $postData->title)
            ->orWhere('slug', Str::slug($postData->title))
            ->first();

        if ($existingPost) {
            return redirect()->back()->withErrors([
                'title' => 'Tiêu đề hoặc đường dẫn (slug) đã tồn tại. Vui lòng chọn tiêu đề khác.',
            ])->withInput();
        }

        // Tạo bài viết mới
        $post = Post::create([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $slug,
            'is_published' => $postData->is_published,
            'user_id' => auth()->id(),
        ]);

        // Gắn danh mục vào bài viết
        if (! empty($postData->categories)) {
            $post->categories()->attach($postData->categories);
        }
        $users = User::all();
        foreach ($users as $user) {
            $user->notify(new NewQuestionOrAnswerNotification('question', [
                'title' => $postData->title,
                'url' => "/posts/{$slug}",
            ]));
        }

        return redirect()->route('/')->with('success', 'Post created successfully!');
    }

    public function show($slug)
    {

        $post = Post::with(['user:id,name,profile_photo_path', 'categories:id,title,slug'])
            ->where('slug', $slug)
            ->firstOrFail();
        $category = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
        // Load all comments with nested replies
        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with(['user:id,name,profile_photo_path'])
            ->with(['allReplies.user:id,name,profile_photo_path']) // Using a new relationship
            ->latest()
            ->get()
            ->map(function ($comment) {
                return $this->formatComment($comment);
            });

        return Inertia::render('Posts/PostDetail', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'published_at' => $post->published_at,
                'user' => $post->user,
                'categories' => $post->categories,
                'comments' => $comments,
            ],
            'categories' => $category,
        ]);
    }

    protected function formatComment($comment)
    {
        return [
            'id' => $comment->id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'profile_photo_path' => $comment->user->profile_photo_path,
            ],
            'comment' => $comment->comment,
            'created_at' => $comment->created_at,
            'parent_id' => $comment->parent_id,
            'replies' => $comment->allReplies->map(function ($reply) {
                return $this->formatComment($reply);
            }),
        ];
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($slug)
    {
        $post = Post::where('slug', $slug)->with('user', 'categories')->firstOrFail();

        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        $categoriesWithCount = Category::getCategoriesCount();

        return Inertia::render('Posts/EditPost', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'category' => $categoriesWithCount,
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
            'categories' => $categoriesWithCount,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreatePostData $request, Post $post)
    {
        // Kiểm tra quyền truy cập
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        // Lấy dữ liệu từ request
        $postData = CreatePostData::from($request);

        // Cập nhật thông tin bài viết
        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
        ]);

        if (! empty($postData->categories)) {
            $post->categories()->sync($postData->categories);
        }

        return redirect()->route('/')->with('success', 'Post updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to delete this post!');
        }
        $post->delete();

        return redirect()->route('/')->with('success', 'Post deleted successfully!');
    }

    public function filterPostByCategory(Request $request, $categorySlug)
    {
        // Lấy thông tin danh mục dựa vào slug
        $category = Category::where('slug', $categorySlug)->firstOrFail();
        $categories = Category::getCategoriesCount();
        // Lấy bài viết thuộc danh mục đó
        $posts = Post::whereHas('categories', function ($query) use ($category) {
            $query->where('categories.id', $category->id);
        })
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->latest()
            ->paginate(6);

        // Định dạng bài viết
        $formattedPosts = $this->getPosts($posts);

        // Trả về dữ liệu thông qua Inertia
        return Inertia::render('Posts/Category', [
            'category' => [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
            ],
            'categories' => $categories,
            'posts' => $formattedPosts,
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

    public function getPosts($posts): \Illuminate\Support\Collection
    {
        $formattedPosts = $posts->items();

        return collect($formattedPosts)->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->getExcerpt(),
                'slug' => $post->slug,
                'upvote_count' => $post->upvotes_count,
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
                'created_at' => $post->created_at->diffForHumans(),
                'published_at' => $post->published_at,
            ];
        });
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
