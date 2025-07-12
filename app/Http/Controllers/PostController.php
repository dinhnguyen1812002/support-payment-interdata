<?php

namespace App\Http\Controllers;

use App\Data\Post\CreatePostData;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class PostController extends Controller
{
    use AuthorizesRequests;

    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(): \Inertia\Response
    {
        // Fetch categories with posts count and logo URL
        $categories = Category::withCount('posts')->latest()->get();  

        return Inertia::render('Dashboard', [
            'categories' => $categories,
        ]);
    }

    public function getAllTicket(Request $request): \Inertia\Response
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

    public function destroy(Post $post)
    {
        $result = $this->postService->deletePost($post);

        return redirect()->back()->with('success', 'delete post successfully.');
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

    public function getTopVotePosts(Request $request): \Illuminate\Http\JsonResponse
    {
        $limit = $request->query('limit', 5);
        $posts = $this->postService->getTopVotePosts($limit);

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
        $post = Post::with(['user', 'categories', 'tags',  'comments', 'upvotes'])->findOrFail($id);

        //        $this->authorize('viewDepartmentPosts', $post->department);

        $data = $this->postService->preparePostData($post);

        return response()->json($data['post']);
    }

    public function transfer(Request $request)
    {
        $apikey = $request->header('X-API-KEY');
        // Kiểm tra API key
        if ($apikey !== config('services.external_api.key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        // Xác thực nguồn
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'tags' => 'nullable|array',
            'categories' => 'nullable|array',
        ]);
        // Tạo bài viết (ticket)
        $result = $this->postService->storeTransferredPost($request->all());

        if (! $result['success']) {
            return response()->json(['error' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'post' => $result['post']]);
    }

    /**
     * @throws AuthorizationException
     */
    public function undoDelete(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'post_id' => 'required',
        ]);
        $result = $this->postService->undoDeletePost($request->post_id);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function updateStatus(Request $request, Post $post): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $post);
        
        if ($post->user_id !== auth()->id()) {
            throw new AuthorizationException('You are not authorized to update this post!');
        }

        $request->validate([
            'is_published' => 'required|boolean',
        ]);
        $post->update([
            'is_published' => $request->boolean('is_published'),
        ]);

        return redirect()->back()->with('success', 'change status successfully.');
    }

    public function restore($id)
    {
        $post = Post::withTrashed()->findOrFail($id);

        if ($post->trashed()) {
            $post->restore();

            return redirect()->back()->with('success', 'Post restored successfully.');
        }

        return redirect()->back()->with('error', 'Post cannot be restored.');
    }

    public function getTrash()
    {
        $posts = Post::onlyTrashed()->get();

        return Inertia::render('Posts/Trash', [
            'posts' => $posts,
        ]);
    }
}
