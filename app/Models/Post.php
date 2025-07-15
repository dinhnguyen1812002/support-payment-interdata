<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use HasFactory, HasUlids, Notifiable, Searchable, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'user_id',
        'is_published',
        'slug',
        'image',
        'product_id',
        'product_name',
        'department_id',
        'status',
        'priority',
        'assignee_id',
        'category_type',
        'priority_score',
        'automation_applied',
        'auto_assigned_at',
        'auto_assigned_by_rule_id',
    ];

    //    protected $fillable = [
    //        'title',
    //        'content',
    //        'slug',
    //        'is_published',
    //        'user_id',
    //        'product_id',
    //        'product_name',
    //    ];

    // Quan hệ với user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id');
    }

    // Quan hệ với categories
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_post');
    }

    // Quan hệ với department
    public function department()
    {
        return $this->belongsTo(Departments::class);
    }

    // Quan hệ với assignee
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    // Quan hệ với automation rule
    public function autoAssignedByRule()
    {
        return $this->belongsTo(AutomationRule::class, 'auto_assigned_by_rule_id');
    }

    // Quan hệ với post tag priorities
    public function tagPriorities()
    {
        return $this->hasMany(PostTagPriority::class);
    }

    // Quan hệ với comments
    public function comments()
    {
        return $this->hasMany(Comments::class);
    }

    // Quan hệ với upvotes
    public function upvotes()
    {
        return $this->hasMany(PostUpvote::class);
    }

    // Đếm số lượng bài viết
    public static function countPosts()
    {
        return self::count();
    }

    // Kiểm tra xem user đã upvote bài viết chưa
    public function isUpvotedBy($userId)
    {
        return $this->upvotes()->where('user_id', $userId)->exists();
    }

    // Lấy đoạn trích nội dung (excerpt)
    public function getExcerpt()
    {
        return Str::limit(strip_tags($this->content), 150);
    }

    // Định dạng dữ liệu bài viết
    public function toFormattedArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->getExcerpt(),
            'slug' => $this->slug,
            'upvote_count' => $this->upvotes_count,
            'is_published' => $this->is_published,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'profile_photo_url' => $this->user->profile_photo_path
                    ? asset('storage/'.$this->user->profile_photo_path)
                    : null
            ] : null,
            'tags' => $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            })->toArray(),
            'categories' => $this->categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'title' => $category->title,
                    'slug' => $category->slug,
                ];
            })->toArray(),
            'comments_count' => $this->comments_count,
            'created_at' => $this->created_at->diffForHumans(),
            // Add other fields as needed
        ];
    }

    // Phương thức lấy danh sách bài viết với tìm kiếm, phân trang và sắp xếp
    public static function getPosts($search = '', $perPage = 6, $sort = 'latest', $tag = null)
    {
        $query = self::query()
            ->where('is_published', true)
            ->with(['user', 'tags', 'categories'])
            ->withCount('upvotes');

        if ($search) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        }

        if ($tag) {
            $query->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag);
            });
        }

        if ($sort === 'latest') {
            $query->latest();
        } elseif ($sort === 'upvotes') {
            $query->orderBy('upvotes_count', 'desc');
        }

        return $query->paginate($perPage);
    }

    // Kiểm tra trùng lặp bài viết
    public static function existsByTitleOrSlug($title, $slug)
    {
        return self::where('title', $title)->orWhere('slug', $slug)->exists();
    }

    // Lấy bài viết theo slug với các thông tin liên quan
    public static function getPostBySlug($slug)
    {
        return self::with(['user:id,name,profile_photo_path', 'categories:id,title,slug', 'tags:id,name'])
            ->withCount(['upvotes', 'comments'])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    // Lấy comments với nested replies
    public function getFormattedComments()
    {
        return $this->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,name,profile_photo_path',
                'user.roles:id,name',
                'user.departments:id,name',
                'allReplies.user:id,name,profile_photo_path',
                'allReplies.user.roles:id,name',
                'allReplies.user.departments:id,name',
            ])
            ->latest()
            ->get()
            ->map(function ($comment) {
                return $this->formatComment($comment);
            });
    }

    // Định dạng comment
    protected function formatComment($comment)
    {
        return [
            'id' => $comment->id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'profile_photo_path' => $comment->user->profile_photo_path,
                'roles' => $comment->user->getRoleNames(),
                'departments' => $comment->user->departments->pluck('name'),
            ],
            'content' => $comment->comment,
            'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
            'parent_id' => $comment->parent_id,
            'is_hr_response' => $comment->is_hr_response ?? false,
            'replies' => $comment->allReplies->map(function ($reply) {
                return $this->formatComment($reply);
            }),
        ];
    }

    // Scope lấy bài viết theo category slug
    public function scopeByCategorySlug(Builder $query, $categorySlug)
    {
        return $query->whereHas('categories', function ($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    public function scopeByTagsSlug(Builder $query, $tagSlug)
    {
        return $query->whereHas('tags', function ($q) use ($tagSlug) {
            $q->where('slug', $tagSlug);
        });
    }

    // Scope tìm kiếm bài viết
    public function scopeSearch(Builder $query, $keyword)
    {
        return $query->where('title', 'like', "%{$keyword}%")
            ->orWhere('content', 'like', "%{$keyword}%");
    }

    // Lấy dữ liệu cho tìm kiếm Scout
    public function toSearchableArray()
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
        ];
    }

    public function receivesBroadcastNotificationsOn()
    {
        return 'users.'.$this->id;
    }

    /**
     * Cast attributes
     */
    protected $casts = [
        'automation_applied' => 'array',
        'auto_assigned_at' => 'datetime',
        'priority_score' => 'integer',
        'is_published' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Priority levels with their display names
     */
    public const PRIORITY_LEVELS = [
        'low' => 'Thấp',
        'medium' => 'Trung bình',
        'high' => 'Cao',
        'urgent' => 'Khẩn cấp',
    ];

    /**
     * Status levels with their display names
     */
    public const STATUS_LEVELS = [
        'open' => 'Mở',
        'in_progress' => 'Đang xử lý',
        'resolved' => 'Đã giải quyết',
        'closed' => 'Đã đóng',
    ];

    /**
     * Category types with their display names
     */
    public const CATEGORY_TYPES = [
        'technical' => 'Kỹ thuật',
        'payment' => 'Thanh toán',
        'consultation' => 'Tư vấn',
        'general' => 'Tổng quát',
    ];

    /**
     * Get human readable priority
     */
    public function getPriorityNameAttribute(): string
    {
        return self::PRIORITY_LEVELS[$this->priority] ?? $this->priority;
    }

    /**
     * Get human readable status
     */
    public function getStatusNameAttribute(): string
    {
        return self::STATUS_LEVELS[$this->status] ?? $this->status;
    }

    /**
     * Get human readable category type
     */
    public function getCategoryTypeNameAttribute(): string
    {
        return self::CATEGORY_TYPES[$this->category_type] ?? $this->category_type;
    }

    /**
     * Calculate priority score based on various factors
     */
    public function calculatePriorityScore(): int
    {
        $score = PostTagPriority::getPriorityScore($this->priority);

        // Adjust based on tag priorities
        $tagPriorityBonus = $this->tagPriorities()->avg('priority_score') ?? 0;
        $score = ($score + $tagPriorityBonus) / 2;

        // Adjust based on age (older tickets get higher priority)
        $ageInHours = $this->created_at->diffInHours(now());
        if ($ageInHours > 24) {
            $score += min(20, $ageInHours / 24 * 5); // Max 20 points bonus
        }

        return min(100, max(0, (int) $score));
    }

    /**
     * Update priority score
     */
    public function updatePriorityScore(): void
    {
        $this->update(['priority_score' => $this->calculatePriorityScore()]);
    }

    /**
     * Scope for filtering by priority
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by category type
     */
    public function scopeByCategoryType($query, string $categoryType)
    {
        return $query->where('category_type', $categoryType);
    }

    /**
     * Scope for filtering by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope for filtering by assignee
     */
    public function scopeByAssignee($query, $userId)
    {
        return $query->where('assignee_id', $userId);
    }

    /**
     * Scope for ordering by priority score
     */
    public function scopeOrderByPriority($query, string $direction = 'desc')
    {
        return $query->orderBy('priority_score', $direction);
    }

    /**
     * Check if post is auto-assigned
     */
    public function isAutoAssigned(): bool
    {
        return ! is_null($this->auto_assigned_at);
    }

    /**
     * Get formatted automation history
     */
    public function getAutomationHistory(): array
    {
        return $this->automation_applied ?? [];
    }
}
