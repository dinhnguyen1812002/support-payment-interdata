<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comments extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = ['post_id', 'user_id', 'parent_id', 'comment'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(Comments::class, 'parent_id'); // Sub-comments (replies)
    }

    public function allReplies()
    {
        return $this->hasMany(Comments::class, 'parent_id')->with('allReplies');
    }

    protected static function boot()
    {
        parent::boot();

        // When deleting a comment, also delete all replies
        static::deleting(function ($comment) {
            $comment->replies()->delete();
        });
    }
}
