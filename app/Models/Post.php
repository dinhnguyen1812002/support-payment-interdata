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

    protected $fillable = ['title', 'content', 'user_id', 'is_published', 'slug', 'image'];

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
            'created_at' => $this->created_at->toDateTimeString(),
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
            ->with(['user:id,name,profile_photo_path', 'allReplies.user:id,name,profile_photo_path'])
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
            ],
            'comment' => $comment->comment,
            'created_at' => $comment->created_at,
            'parent_id' => $comment->parent_id,
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
}
