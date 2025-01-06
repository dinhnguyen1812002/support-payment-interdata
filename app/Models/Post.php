<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    //
    use HasFactory,SoftDeletes;
    use HasUlids;

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
}
