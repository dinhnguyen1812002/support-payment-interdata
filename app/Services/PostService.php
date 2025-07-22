<?php

namespace App\Services;

use App\Data\Post\CreatePostData;
use App\Events\NewPostCreated;
use App\Events\NewQuestionCreated;
use App\Jobs\ForceDeletePost;
use App\Models\Category;
use App\Models\Departments;
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
    protected TicketAutomationService $automationService;

    public function __construct(TicketAutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

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
        $hasUpvote = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        return [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'created_at' => $post->created_at->diffForHumans(),
                'updated_at' => $post->updated_at,
                'is_published' => $post->is_published,
                'user' => $post->user,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'comments' => $comments,
                'upvote_count' => $post->upvotes_count,
                'has_upvote' => $hasUpvote,
                'priority' => $post->priority,
                'priority_name' => $post->priority_name,
                'priority_score' => $post->priority_score,
                'status' => $post->status,
                'status_name' => $post->status_name,
                'category_type' => $post->category_type,
                'category_type_name' => $post->category_type_name,
                'assignee' => $post->assignee,
                'department' => $post->department,
                'is_auto_assigned' => $post->isAutoAssigned(),
                'automation_history' => $post->getAutomationHistory(),
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
        $myTicketsCount = auth()->check() ? Post::where('user_id', auth()->id())->count() : 0;

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
            'myTicketsCount' => $myTicketsCount,
            'upvote_count' => $posts->sum('upvote_count'),
            'pagination' => $this->getPaginationData($posts),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
            'selectedTag' => $tag,
        ];
    }

    public function getMyTickets(Request $request): array
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');
        $tag = $request->input('tag', null);

        // Get only current user's posts
        $posts = Post::where('user_id', auth()->id())
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($tag, function ($query, $tag) {
                return $query->whereHas('tags', function ($q) use ($tag) {
                    $q->where('tags.id', $tag);
                });
            })
            ->with(['user', 'categories', 'tags', 'comments'])
            ->withCount(['comments', 'upvotes'])
            ->orderBy($sort === 'oldest' ? 'created_at' : 'created_at', $sort === 'oldest' ? 'asc' : 'desc')
            ->paginate(6);

        $categories = $this->getCategories();
        $tags = $this->getTags();
        $allTicketsCount = Post::count();
        $myTicketsCount = Post::where('user_id', auth()->id())->count();

        $user = auth()->user();
        $notifications = $user?->unreadNotifications ?? [];

        return [
            'posts' => $posts->map(function ($post) {
                return $post->toFormattedArray();
            }),
            'categories' => $categories,
            'tags' => $tags,
            'postCount' => $allTicketsCount,
            'myTicketsCount' => $myTicketsCount,
            'pagination' => $this->getPaginationData($posts),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
            'selectedTag' => $tag,
            'filters' => ['myTickets' => true], // Mark this as my tickets view
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
            // Auto-categorize and prioritize based on content
            $categoryType = $this->automationService->categorizePost((object) [
                'title' => $postData->title,
                'content' => $postData->content,
            ]);

            $priority = $this->automationService->calculatePriority((object) [
                'title' => $postData->title,
                'content' => $postData->content,
            ]);

            // Create post with only necessary data
            $post = Post::create([
                'title' => $postData->title,
                'content' => $postData->content,
                'slug' => $slug,
                'is_published' => $postData->is_published,
                'user_id' => auth()->id(),
                'category_type' => $categoryType,
                'priority' => $priority,
                'status' => 'open',
            ]);

            // Batch attach relationships - more efficient than individual attaches
            if (! empty($postData->categories)) {
                $post->categories()->attach($postData->categories);
            }

            if (! empty($postData->tags)) {
                $post->tags()->attach($postData->tags);
            }
            $post->load('tags', 'categories', 'user');

            // Apply automation rules after relationships are loaded
            $this->automationService->applyAutomationRules($post);
            // Queue these operations to improve response time
            dispatch(function () use ($post) {
                $this->notifyUsers($post);
                $this->notifyDepartment($post);
            })->afterCommit();

            dispatch(function () use ($post) {
                // Broadcast đến kênh notifications chung
                broadcast(new NewQuestionCreated($post))->toOthers();

                // Broadcast đến kênh của phòng ban cụ thể
                if ($post->department_id) {
                    broadcast(new NewPostCreated($post))->toOthers();
                }
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
        DB::table('notifications')
            ->whereJsonContains('data->post_id', $post->id)
            ->delete();

        //    $post->forceDelete();
        $post->delete();

        //    ForceDeletePost::dispatch($post->id)->delay(now()->addMinute());
        return [
            'success' => true,
            'message' => 'Bài viết đã được xóa thành công!',
        ];
    }
    // public function deletePost(Post $post): array
    // {
    //     // Soft delete the post
    //     $post->delete();

    //     // Remove related notifications (optional, or move to force delete)
    //     DB::table('notifications')
    //         ->whereJsonContains('data->post_id', $post->id)
    //         ->delete();

    //     // Dispatch a job to force delete after 30 seconds
    //     dispatch(function () use ($post) {
    //         $freshPost = Post::withTrashed()->find($post->id);
    //         if ($freshPost && $freshPost->trashed()) {
    //             $freshPost->forceDelete();
    //         }
    //     })->delay(now()->addSeconds(30));

    //     return [
    //         'success' => true,
    //         'message' => 'Post deleted. You can undo this action within 30 seconds.',
    //         'undo_available' => true,
    //         'post_id' => $post->id,
    //     ];
    // }
    public function undoDeletePost(string $postId): array
    {
        $post = Post::withTrashed()->findOrFail($postId);
        if ($post->trashed()) {
            $post->restore();

            return [
                'success' => true,
                'message' => 'Post restored successfully!',
            ];
        }

        return [
            'success' => false,
            'message' => 'Unable to restore post.',
        ];
    }

    public function getPostsByCategorySlug(string $categorySlug): array
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $posts = Post::byCategorySlug($categorySlug)
            ->where('is_published', true)
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
            ->where('is_published', true)
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
            ->where('is_published', true)
            ->with(['user', 'categories'])
            ->withCount('upvotes')
            ->when($sort === 'latest', fn ($q) => $q->latest())
            ->when($sort === 'upvote', fn ($q) => $q->orderBy('upvotes_count', 'desc'))
            ->paginate(6)
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

    public function getTopVotePosts(int $limit = 5): Collection
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
            ->orderBy('upvote_count', 'desc')
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
        // Lấy danh sách user có vai trò 'admin' hoặc 'employee'
        $users = User::role(['admin', 'employee'])->get();

        foreach ($users as $user) {
            if ($user->can('receiveNotification', $post)) {
                $user->notify(new NewPostNotification($post));
            }
        }
    }

    public function notifyDepartment(Post $post): void
    {
        // Nếu bài viết thuộc về một phòng ban cụ thể
        if ($post->department_id) {
            $department = Departments::with(['users' => function ($query) {
                $query->whereHas('roles', function ($q) {
                    $q->whereIn('name', ['admin', 'employee']);
                });
            }])->find($post->department_id);

            if ($department && $department->users->isNotEmpty()) {
                // Gửi thông báo cho tất cả người dùng trong phòng ban
                // Chỉ gửi cho những người dùng có vai trò phù hợp
                $department->users->each(function ($user) use ($post) {
                    // Không gửi thông báo cho người tạo bài viết
                    // và đảm bảo người dùng có quyền nhận thông báo
                    if ($user->id !== $post->user_id) {
                        $user->notify(new NewPostNotification($post));
                    }
                });
            }
        }
    }

    public function storeTransferredPost(array $data): array
    {
        $slug = Str::slug($data['title']);

        if (Post::existsByTitleOrSlug($data['title'], $slug)) {
            return [
                'success' => false,
                'errors' => [
                    'title' => 'Tiêu đề hoặc đường dẫn (slug) đã tồn tại. Vui lòng chọn tiêu đề khác.',
                ],
            ];
        }

        // Auto-categorize and prioritize based on content
        $categoryType = $this->automationService->categorizePost((object) [
            'title' => $data['title'],
            'content' => $data['content'],
        ]);

        $priority = $this->automationService->calculatePriority((object) [
            'title' => $data['title'],
            'content' => $data['content'],
        ]);

        $post = Post::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'slug' => $slug,
            'is_published' => false,
            'user_id' => $data['user_id'],
            'product_id' => $data['product_id'],
            'product_name' => $data['product_name'],
            'category_type' => $categoryType,
            'priority' => $priority,
            'status' => 'open',
        ]);

        if (! empty($data['categories'])) {
            $post->categories()->attach($data['categories']);
        }

        if (! empty($data['tags'])) {
            $post->tags()->attach($data['tags']);
        }

        $post->load('tags', 'categories', 'user');

        // Apply automation rules
        $this->automationService->applyAutomationRules($post);

        $this->notifyUsers($post);

        $this->notifyDepartment($post);

        broadcast(new NewQuestionCreated($post))->toOthers();

        return [
            'success' => true,
            'message' => 'Ticket created successfully!',
            'post' => $post,
        ];
    }
}
