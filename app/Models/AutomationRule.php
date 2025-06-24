<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'conditions',
        'actions',
        'category_type',
        'assigned_priority',
        'assigned_department_id',
        'assigned_user_id',
        'execution_order',
        'matched_count',
        'last_matched_at',
    ];

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
        'matched_count' => 'integer',
        'execution_order' => 'integer',
        'last_matched_at' => 'datetime',
    ];

    /**
     * Category types available
     */
    public const CATEGORY_TYPES = [
        'technical' => 'Kỹ thuật',
        'payment' => 'Thanh toán',
        'consultation' => 'Tư vấn',
        'general' => 'Tổng quát',
    ];

    /**
     * Priority levels available
     */
    public const PRIORITY_LEVELS = [
        'low' => 'Thấp',
        'medium' => 'Trung bình',
        'high' => 'Cao',
        'urgent' => 'Khẩn cấp',
    ];

    /**
     * Get the department assigned to this rule
     */
    public function assignedDepartment(): BelongsTo
    {
        return $this->belongsTo(Departments::class, 'assigned_department_id');
    }

    /**
     * Get the user assigned to this rule
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /**
     * Get posts that were auto-assigned by this rule
     */
    public function autoAssignedPosts(): HasMany
    {
        return $this->hasMany(Post::class, 'auto_assigned_by_rule_id');
    }

    /**
     * Scope to get active rules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get rules ordered by execution priority
     */
    public function scopeOrderedByExecution($query)
    {
        return $query->orderBy('execution_order', 'asc');
    }

    /**
     * Scope to get rules by category type
     */
    public function scopeByCategoryType($query, string $categoryType)
    {
        return $query->where('category_type', $categoryType);
    }

    /**
     * Check if this rule matches the given post
     */
    public function matchesPost(Post $post): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $conditions = $this->conditions ?? [];

        // Check title keywords
        if (isset($conditions['title_keywords']) && ! empty($conditions['title_keywords'])) {
            $titleMatched = false;
            foreach ($conditions['title_keywords'] as $keyword) {
                if (stripos($post->title, $keyword) !== false) {
                    $titleMatched = true;
                    break;
                }
            }
            if (! $titleMatched) {
                return false;
            }
        }

        // Check content keywords
        if (isset($conditions['content_keywords']) && ! empty($conditions['content_keywords'])) {
            $contentMatched = false;
            foreach ($conditions['content_keywords'] as $keyword) {
                if (stripos($post->content, $keyword) !== false) {
                    $contentMatched = true;
                    break;
                }
            }
            if (! $contentMatched) {
                return false;
            }
        }

        // Check categories
        if (isset($conditions['category_ids']) && ! empty($conditions['category_ids'])) {
            $postCategoryIds = $post->categories->pluck('id')->toArray();
            $hasMatchingCategory = ! empty(array_intersect($conditions['category_ids'], $postCategoryIds));
            if (! $hasMatchingCategory) {
                return false;
            }
        }

        // Check tags
        if (isset($conditions['tag_ids']) && ! empty($conditions['tag_ids'])) {
            $postTagIds = $post->tags->pluck('id')->toArray();
            $hasMatchingTag = ! empty(array_intersect($conditions['tag_ids'], $postTagIds));
            if (! $hasMatchingTag) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply this rule to a post
     */
    public function applyToPost(Post $post): void
    {
        $actions = $this->actions ?? [];
        $updates = [];

        // Set priority
        if ($this->assigned_priority) {
            $updates['priority'] = $this->assigned_priority;
            $updates['priority_score'] = PostTagPriority::getPriorityScore($this->assigned_priority);
        }

        // Set category type
        if ($this->category_type) {
            $updates['category_type'] = $this->category_type;
        }

        // Set department
        if ($this->assigned_department_id) {
            $updates['department_id'] = $this->assigned_department_id;
        }

        // Set assignee
        if ($this->assigned_user_id) {
            $updates['assignee_id'] = $this->assigned_user_id;
        }

        // Track automation
        $updates['auto_assigned_at'] = now();
        $updates['auto_assigned_by_rule_id'] = $this->id;

        // Track applied automation rules
        $appliedRules = $post->automation_applied ?? [];
        $appliedRules[] = [
            'rule_id' => $this->id,
            'rule_name' => $this->name,
            'applied_at' => now()->toISOString(),
            'actions_taken' => $updates,
        ];
        $updates['automation_applied'] = $appliedRules;

        // Update post
        $post->update($updates);

        // Update rule statistics
        $this->increment('matched_count');
        $this->update(['last_matched_at' => now()]);
    }

    /**
     * Get human readable category type
     */
    public function getCategoryTypeNameAttribute(): string
    {
        return self::CATEGORY_TYPES[$this->category_type] ?? $this->category_type;
    }

    /**
     * Get human readable priority level
     */
    public function getPriorityLevelNameAttribute(): string
    {
        return self::PRIORITY_LEVELS[$this->assigned_priority] ?? $this->assigned_priority;
    }
}
