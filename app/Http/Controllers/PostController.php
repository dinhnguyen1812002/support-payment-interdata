<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Data\Post\PostData;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $category = Category::all(['id', 'title', 'slug']);
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
        $categories = Category::all(['id', 'title']);

        return Inertia::render('Posts/Create', [
            'categories' => $categories,
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
    public function show($slug)
    {
        $post = Post::where('slug', $slug)
            ->with(['user:id,name,profile_photo_path', 'categories:id,title'])
            ->firstOrFail();

        return Inertia::render('Posts/PostDetail', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'categories' => $post->categories->map(fn($category) => [
                    'id' => $category->id,
                    'title' => $category->title,
                ]),
                'user' => [
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->diffForHumans(),
            ],
        ]);
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

        // Lấy tất cả danh mục
        $allCategories = Category::all(['id', 'title']);

        // Pass dữ liệu đến view
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
            'categories' => $allCategories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreatePostData $request, Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        $postData = PostData::from($request);

        // Cập nhật thông tin bài viết
        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
        ]);

        if (! empty($postData->categories)) {
            $post->categories()->sync($postData->categories);
        } else {
            $post->categories()->detach();
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
