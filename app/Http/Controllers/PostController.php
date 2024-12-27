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
    /**
     * Display a listing of the resource.
     */
//    public function index()
//    {
//        $categories = Category::latest()->get();
//
//        $posts = Post::with('user')->latest()->paginate(10)->map(function ($post) {
//
//            $firstSentence = strtok($post->content, '.');
//
//            return [
//                'id' => $post->id,
//                'title' => $post->title,
//                'content' => $firstSentence,
//                'slug' => $post->slug,
//                'user' => [
//                    'name' => $post->user->name,
//                    'profile_photo_path' => $post->user->profile_photo_path,
//                ],
//                'created_at' => $post->created_at->diffForHumans(),
//                'published_at' => $post->published_at,
//            ];
//        });
//
//        return Inertia::render('Posts/Index', [
//            'posts' => $posts,
//            'categories' => $categories,
//
//        ]);
//    }
    public function index()
    {
        $categories = Category::latest()->get();

        $posts = Post::with('user')
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
            'categories' => $categories,
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
        if (!empty($postData->categories)) {
            $post->categories()->attach($postData->categories);
        }

        return redirect()->route('posts.index')->with('success', 'Post created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        $post = Post::where('slug', $slug)
            ->with('user')
            ->firstOrFail();

        // Chuyển đổi `created_at` sang `diffForHumans`
        $post->created_at_human = $post->created_at->diffForHumans();

        return Inertia::render('Posts/PostDetail', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'user' => [
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at_human,
            ],
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */

    public function edit($slug)
    {

        // Retrieve the post using the slug, including the user relationship
        $post = Post::where('slug', $slug)->with('user')->firstOrFail();
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }

        // Pass the post to the Inertia view for editing
        return Inertia::render('Posts/EditPost', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'is_published' => $post->is_published,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->toDateTimeString(),
                'updated_at' => $post->updated_at->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostData $request, Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return redirect()->route('/')->with('error', 'You are not authorized to update this post!');
        }
        $postData = PostData::from($request);

        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
        ]);

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
