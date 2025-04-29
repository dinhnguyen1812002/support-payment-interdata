<?php

namespace App\Services;

use App\Data\Post\CreatePostData;
use App\Events\NewQuestionCreated;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Notifications\NewPostNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostService
{
    public function preparePostData(Post $post): array
    {
        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        $tag = Tag::select(['id', 'name'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();

        $comments = $post->getFormattedComments();
        $hasUpvoted = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        return [
            'post' => [
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
            ],
            'categories' => $categories,
            'tag' => $tag,
        ];
    }

    public function getPostsForIndex(Request $request): array
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');
        $tag = $request->input('tag', null);

        $posts = Post::getPosts($search, 6, $sort, $tag);
        $totalComment = Post::withCount('comments')->count();

        $categories = $this->getCategories();
        $tags = $this->getTags();
        $postCount = Post::count();

        $user = auth()->user();
        $notifications = $user?->unreadNotifications ?? [];

        return [
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
            'totalComment' => $totalComment,
            'categories' => $categories,
            'tags' => $tags,
            'postCount' => $postCount,
            'upvotes_count' => $posts->sum('upvotes_count'),
            'pagination' => $this->getPaginationData($posts),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
            'selectedTag' => $tag,
        ];
    }

    public function getCreatePageData(): array
    {
        return [
            'categories' => $this->getCategories(),
            'tags' => $this->getTags(),
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ];
    }

    public function storePost(CreatePostData $postData): array
    {
        // Use caching on the slug generation to avoid regeneration
        $slug = Str::slug($postData->title);

        // Single check for duplicate - potentially using transaction for safety
        if (Post::whereTitle($postData->title)->orWhere('slug', $slug)->exists()) {
            return [
                'success' => false,
                'errors' => [
                    'title' => 'Tiêu đề hoặc đường dẫn (slug) đã tồn tại. Vui lòng chọn tiêu đề khác.',
                ],
            ];
        }

        // Start database transaction to ensure data integrity
        return DB::transaction(function () use ($postData, $slug) {
            // Create post with only necessary data
            $post = Post::create([
                'title' => $postData->title,
                'content' => $postData->content,
                'slug' => $slug,
                'is_published' => $postData->is_published,
                'user_id' => auth()->id(),
            ]);

            // Batch attach relationships - more efficient than individual attaches
            if (! empty($postData->categories)) {
                $post->categories()->attach($postData->categories);
            }

            if (! empty($postData->tags)) {
                $post->tags()->attach($postData->tags);
            }
            $post->load('tags', 'categories', 'user');
            // Queue these operations to improve response time
            dispatch(function () use ($post) {
                $this->notifyUsers($post);
            })->afterCommit();

            dispatch(function () use ($post) {
                broadcast(new NewQuestionCreated($post))->toOthers();
            })->afterCommit();

            return [
                'success' => true,
                'message' => 'Post created successfully!',
            ];
        });
    }

    public function getEditPostData(string $slug): array
    {
        $post = Post::where('slug', $slug)->with(['user', 'categories', 'tags'])->firstOrFail();

        if ($post->user_id !== auth()->id()) {
            return [
                'success' => false,
                'error' => 'You are not authorized to update this post!',
            ];
        }

        return [
            'success' => true,
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'slug' => $post->slug,
                'is_published' => $post->is_published,
                'categories' => $post->categories->pluck('id')->toArray(),
                'tags' => $post->tags->pluck('id')->toArray(),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'profile_photo_path' => $post->user->profile_photo_path,
                ],
                'created_at' => $post->created_at->toDateTimeString(),
                'updated_at' => $post->updated_at->toDateTimeString(),
            ],
            'tags' => $this->getTags(),
            'categories' => $this->getCategories(),
            'keyword' => request()->input('search', ''),
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ];
    }

    public function updatePost(CreatePostData $postData, Post $post): array
    {
        if ($post->user_id !== auth()->id()) {
            return [
                'success' => false,
                'error' => 'You are not authorized to update this post!',
            ];
        }

        $post->update([
            'title' => $postData->title,
            'content' => $postData->content,
            'slug' => $postData->slug ?? Str::slug($postData->title),
            'is_published' => $postData->is_published,
        ]);

        if (! empty($postData->categories)) {
            $post->categories()->sync($postData->categories);
        }

        if (! empty($postData->tags)) {
            $post->tags()->sync($postData->tags);
        }

        return [
            'success' => true,
            'message' => 'Post updated successfully!',
        ];
    }

    public function deletePost(Post $post): array
    {
        $post->delete();

        return [
            'success' => true,
            'message' => 'Bài viết đã được xóa thành công!',
        ];
    }

    public function getPostsByCategorySlug(string $categorySlug): array
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $posts = Post::byCategorySlug($categorySlug)
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->latest()
            ->paginate(6);

        $categories = $this->getCategories();

        return [
            'category' => [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
            ],
            'categories' => $categories,
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
            'pagination' => $this->getPaginationData($posts),
        ];
    }

    public function getPostsByTagSlug(string $tagsSlug): array
    {
        $tag = Tag::where('slug', $tagsSlug)->firstOrFail();

        $posts = Post::byTagsSlug($tagsSlug)
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->latest()
            ->paginate(6);

        return [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
            'categories' => $this->getCategories(),
            'tags' => $this->getTags(),
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
            'pagination' => $this->getPaginationData($posts),
        ];
    }

    public function searchPosts(Request $request): array
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');

        // Tìm kiếm ID các bài viết phù hợp
        $postIds = Post::search($search)->keys();

        // Truy vấn thực tế từ database với điều kiện ID
        $posts = Post::whereIn('id', $postIds)
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->when($sort === 'latest', fn ($q) => $q->latest())
            ->when($sort === 'upvotes', fn ($q) => $q->orderBy('upvotes_count', 'desc'))
            ->paginate(10)
            ->withQueryString();

        $user = auth()->user();
        $notifications = $user ? $user->unreadNotifications : [];

        return [
            'posts' => $posts->map(fn ($post) => $post->toFormattedArray()),
            'categories' => $this->getCategories(),
            'postCount' => $posts->total(),
            'pagination' => $this->getPaginationData($posts),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
        ];
    }

    public function getLatestPosts(int $limit = 5): Collection
    {
        return Post::select(['id', 'title', 'slug'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getPostCount(): int
    {
        return Post::count();
    }

    public function getTopVotedPosts(int $limit = 5): array
    {
        $posts = Post::with(['user:id,name,profile_photo_path'])
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc')
            ->take($limit)
            ->get();

        return $posts->map(function ($post) {
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
        })->toArray();
    }

    // Private helper methods
    private function getCategories(): Collection
    {
        return Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
    }

    private function getTags(): Collection
    {
        return Tag::select(['id', 'name', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
    }

    private function getPaginationData(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
        ];
    }

    private function notifyUsers(Post $post): void
    {
        $users = User::all();

        foreach ($users as $user) {
            if ($user->can('receiveNotification', $post)) {
                $user->notify(new NewPostNotification($post));
            }
        }
    }
}
