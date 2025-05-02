<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request): \Inertia\Response
    {
        $data = $this->postService->getPostsForIndex($request);

        return Inertia::render('Posts/Index', $data);
    }

    public function create(): \Inertia\Response
    {
        $data = $this->postService->getCreatePageData();

        return Inertia::render('Posts/Create', $data);
    }

    public function store(CreatePostData $postData): \Illuminate\Http\RedirectResponse
    {
        $result = $this->postService->storePost($postData);

        if (! $result['success']) {
            return redirect()->back()->withErrors($result['errors'])->withInput();
        }

        return redirect()->route('/')->with('success', $result['message']);
    }

    public function show(string $slug): \Inertia\Response
    {
        $post = Post::getPostBySlug($slug);
        $data = $this->postService->preparePostData($post);

        return Inertia::render('Posts/PostDetail', $data);
    }

    public function edit(string $slug): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        $result = $this->postService->getEditPostData($slug);

        if (! $result['success']) {
            return redirect()->route('/')->with('error', $result['error']);
        }

        return Inertia::render('Posts/EditPost', $result);
    }

    public function update(CreatePostData $request, Post $post): \Illuminate\Http\RedirectResponse
    {
        $postData = CreatePostData::from($request);
        $result = $this->postService->updatePost($postData, $post);

        if (! $result['success']) {
            return redirect()->route('/')->with('error', $result['error']);
        }

        return redirect()->back()->with('success', $result['message']);
    }

    public function destroy(Post $post): \Illuminate\Http\RedirectResponse
    {
        $result = $this->postService->deletePost($post);

        return back()->with('success', $result['message']);
    }

    public function filterPostByCategory(Request $request, $categorySlug): \Inertia\Response
    {
        $data = $this->postService->getPostsByCategorySlug($categorySlug);

        return Inertia::render('Posts/Category', $data);
    }

    public function filterPostByTag(Request $request, $tagsSlug): \Inertia\Response
    {
        $data = $this->postService->getPostsByTagSlug($tagsSlug);

        return Inertia::render('Posts/Tags', $data);
    }

    public function search(Request $request): \Inertia\Response
    {
        $data = $this->postService->searchPosts($request);

        return Inertia::render('Posts/Search', $data);
    }

    public function getLatestPosts(Request $request): \Illuminate\Http\JsonResponse
    {
        $limit = $request->query('limit', 5);
        $posts = $this->postService->getLatestPosts($limit);

        return response()->json($posts);
    }

    public function getCountPost(): \Illuminate\Http\JsonResponse
    {
        $postCount = $this->postService->getPostCount();

        return response()->json($postCount);
    }

    public function topVotedPosts(Request $request): \Illuminate\Http\JsonResponse
    {
        $limit = $request->query('limit', 5);
        $posts = $this->postService->getTopVotedPosts($limit);

        return response()->json(['data' => $posts]);
    }
    public function showById($id)
    {
        $post = Post::with(['user', 'categories', 'tags'])->findOrFail($id);
        $data = $this->postService->preparePostData($post);

        return response()->json($data['post']);
    }
}
