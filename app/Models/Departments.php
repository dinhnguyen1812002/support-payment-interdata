<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Departments extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = ['name', 'slug', 'description'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'department_user', 'department_id', 'user_id');
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public static function getDepartmentsWithPostCount()
    {
        return self::select(['id', 'name', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
    }
}
