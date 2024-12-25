<?php

namespace App\Http\Controllers;

use App\Data\Post\PostData;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with('user')->latest()->get()->map(function ($post) {
            // Extract the first sentence
            $firstSentence = strtok($post->content, '.');

            // Return post data with modified content
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $firstSentence, // Only the first sentence
                'slug' => $post->slug,
                'user' => [
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at,
                'published_at' => $post->published_at,
            ];
        });

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
        ]);

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Posts/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostData $request)
    {

        $postData = PostData::from($request);

        $post = Post::create([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('/')->with('success', 'Post created successfully!');
    }

    /**
     * Display the specified resource.
     */
public function show($slug)
{
    $post = Post::where('slug', $slug)->with('user')->firstOrFail();
    return Inertia::render('Posts/PostDetail', [
        'post' => $post,
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
       return Inertia::render("Posts/Edit", [
           'post' => $post
       ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostData $request, Post $post)
    {
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
        $post->delete();
        return redirect()->route('/')->with('success', 'Post deleted successfully!');
    }
}
