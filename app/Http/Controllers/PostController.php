<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $category = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
        $posts = Post::with(['user', 'categories'])
            ->latest()
            ->paginate(6);

        $formattedPosts = $posts->items();
        $formattedPosts = collect($formattedPosts)->map(function ($post) {

            $firstSentence = strtok($post->content, '.');

            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $firstSentence,
                'slug' => $post->slug,
                'categories' => $post->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'title' => $category->title,
                    ];
                }),
                'user' => [
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->diffForHumans(),
                'published_at' => $post->published_at,
            ];
        });

        return Inertia::render('Posts/Index', [
            'posts' => $formattedPosts,
            'categories' => $category,
            'postCount' => Post::count(),
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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

        $categories = Category::getCategoriesCount();

        return Inertia::render('Posts/Create', [
            'categories' => $categories,
            //            'category' => Category::getCategoriesCount(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePostData $postData)
    {
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
            'slug' => Str::slug($postData->title),
            'is_published' => $postData->is_published,
            'user_id' => auth()->id(),
        ]);

        // Gắn danh mục vào bài viết
        if (! empty($postData->categories)) {
            $post->categories()->attach($postData->categories);
        }

        return redirect()->route('/')->with('success', 'Post created successfully!');
    }

    /**
     * Display the specified resource.
     */
    //    public function show($slug)
    //    {
    //        $post = Post::where('slug', $slug)
    //            ->with(['user:id,name,profile_photo_path', 'categories:id,title'])
    //            ->firstOrFail();
    //
    //        return Inertia::render('Posts/PostDetail', [
    //            'post' => [
    //                'id' => $post->id,
    //                'title' => $post->title,
    //                'content' => $post->content,
    //                'slug' => $post->slug,
    //                'categories' => $post->categories->map(fn ($category) => [
    //                    'id' => $category->id,
    //                    'title' => $category->title,
    //                ]),
    //                'user' => [
    //                    'name' => $post->user->name,
    //                    'profile_photo_path' => $post->user->profile_photo_path,
    //                ],
    //                'created_at' => $post->created_at->diffForHumans(),
    //            ],
    //        ]);
    //    }
    //PostController.php
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

    private function formatComment($comment)
    {
        $formattedComment = [
            'id' => $comment->id,
            'comment' => $comment->comment,
            'created_at' => $comment->created_at->diffForHumans(),
            'user' => [
                'name' => $comment->user->name,
                'profile_photo_path' => $comment->user->profile_photo_path,
            ],
            'replies' => [],
        ];

        // Recursively format replies
        if ($comment->allReplies) {
            $formattedComment['replies'] = $comment->allReplies->map(function ($reply) {
                return $this->formatComment($reply);
            });
        }

        return $formattedComment;
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
}
