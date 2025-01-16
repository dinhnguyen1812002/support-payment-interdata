<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Post extends Model
{
    //
    use HasFactory,SoftDeletes;
    use HasUlids;
    use Notifiable;
    use Searchable;

    protected $fillable = ['title', 'content', 'user_id', 'is_published', 'slug', 'image'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_post');
    }

    public function countPost()
    {
        return Post::count();
    }

    public function comments()
    {
        return $this->hasMany(Comments::class);
    }

    public function upvotes()
    {
        return $this->hasMany(PostUpvote::class);
    }

    public function upvoteCount()
    {
        return $this->upvotes()->count();
    }

    public function getExcerpt()
    {
        return Str::limit(strip_tags($this->content), 150);
    }

    public function isUpvotedBy($userId)
    {
        return $this->upvotes()->where('user_id', $userId)->exit();
    }

    public function toSearchableArray()
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
        ];
    }

    public function scopeSearch(Builder $query, string $keyword): Builder
    {
        return $query->with(['user', 'categories'])
            ->where('title', 'like', "%{$keyword}%")
            ->orWhere('content', 'like', "%{$keyword}%")
            ->withCount('upvotes')
            ->orderBy('upvotes_count', 'desc');
    }
}
