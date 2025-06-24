<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostTagPriority extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'tag_id',
        'priority',
        'priority_score',
        'automation_rules',
    ];

    protected $casts = [
        'automation_rules' => 'array',
        'priority_score' => 'integer',
    ];

    /**
     * Priority levels with their corresponding scores
     */
    public const PRIORITY_SCORES = [
        'low' => 25,
        'medium' => 50,
        'high' => 75,
        'urgent' => 100,
    ];

    /**
     * Get the post that owns the priority
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the tag that owns the priority
     */
    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }

    /**
     * Get priority score based on priority level
     */
    public static function getPriorityScore(string $priority): int
    {
        return self::PRIORITY_SCORES[$priority] ?? 50;
    }

    /**
     * Get priority level based on score
     */
    public static function getPriorityLevel(int $score): string
    {
        if ($score >= 90) {
            return 'urgent';
        }
        if ($score >= 70) {
            return 'high';
        }
        if ($score >= 40) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Scope to get priorities by priority level
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to get priorities by score range
     */
    public function scopeByScoreRange($query, int $minScore, int $maxScore)
    {
        return $query->whereBetween('priority_score', [$minScore, $maxScore]);
    }
}
