<?php

namespace App\Services;

use App\Models\AutomationRule;
use App\Models\Post;
use App\Models\PostTagPriority;
use Illuminate\Support\Facades\Log;

class TicketAutomationService
{
    /**
     * Apply automation rules to a post
     */
    public function applyAutomationRules(Post $post): void
    {
        try {
            // Get active rules ordered by execution priority
            $rules = AutomationRule::active()
                ->orderedByExecution()
                ->get();

            $appliedRules = [];

            foreach ($rules as $rule) {
                if ($rule->matchesPost($post)) {
                    $rule->applyToPost($post);
                    $appliedRules[] = $rule->name;

                    Log::info('Automation rule applied', [
                        'post_id' => $post->id,
                        'rule_id' => $rule->id,
                        'rule_name' => $rule->name,
                    ]);
                }
            }

            // Update priority score after all rules are applied
            $post->refresh();
            $post->updatePriorityScore();

            // Create post-tag priorities
            $this->createPostTagPriorities($post);

            Log::info('Ticket automation completed', [
                'post_id' => $post->id,
                'applied_rules' => $appliedRules,
                'final_priority' => $post->priority,
                'final_score' => $post->priority_score,
            ]);

        } catch (\Exception $e) {
            Log::error('Ticket automation failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create post-tag priority relationships
     */
    protected function createPostTagPriorities(Post $post): void
    {
        foreach ($post->tags as $tag) {
            PostTagPriority::updateOrCreate(
                [
                    'post_id' => $post->id,
                    'tag_id' => $tag->id,
                ],
                [
                    'priority' => $post->priority,
                    'priority_score' => $post->priority_score,
                    'automation_rules' => $post->automation_applied,
                ]
            );
        }
    }

    /**
     * Categorize post automatically based on content
     */
    public function categorizePost($post): string
    {
        $title = strtolower($post->title);
        $content = strtolower($post->content);
        $text = $title.' '.$content;

        // Technical keywords
        $technicalKeywords = [
            'lỗi', 'bug', 'không hoạt động', 'không chạy', 'crash', 'error',
            'api', 'database', 'server', 'code', 'technical', 'kỹ thuật',
            'cài đặt', 'config', 'thiết lập', 'tích hợp', 'integration',
        ];

        // Payment keywords
        $paymentKeywords = [
            'thanh toán', 'payment', 'tiền', 'money', 'invoice', 'hóa đơn',
            'refund', 'hoàn tiền', 'charge', 'billing', 'subscription',
            'gói cước', 'phí', 'cost', 'price', 'giá',
        ];

        // Consultation keywords
        $consultationKeywords = [
            'tư vấn', 'consultation', 'hỏi', 'question', 'help', 'giúp đỡ',
            'hướng dẫn', 'guide', 'how to', 'làm sao', 'cách', 'support',
        ];

        // Count matches for each category
        $technicalScore = $this->countKeywordMatches($text, $technicalKeywords);
        $paymentScore = $this->countKeywordMatches($text, $paymentKeywords);
        $consultationScore = $this->countKeywordMatches($text, $consultationKeywords);

        // Determine category based on highest score
        $maxScore = max($technicalScore, $paymentScore, $consultationScore);

        if ($maxScore === 0) {
            return 'general';
        }

        if ($technicalScore === $maxScore) {
            return 'technical';
        } elseif ($paymentScore === $maxScore) {
            return 'payment';
        } elseif ($consultationScore === $maxScore) {
            return 'consultation';
        }

        return 'general';
    }

    /**
     * Calculate priority based on content analysis
     */
    public function calculatePriority($post): string
    {
        $title = strtolower($post->title);
        $content = strtolower($post->content);
        $text = $title.' '.$content;

        // Urgent keywords
        $urgentKeywords = [
            'khẩn cấp', 'urgent', 'emergency', 'gấp', 'ngay lập tức',
            'critical', 'down', 'không thể', 'mất dữ liệu', 'data loss',
        ];

        // High priority keywords
        $highKeywords = [
            'quan trọng', 'important', 'cao', 'high', 'ảnh hưởng lớn',
            'nhiều người', 'production', 'live', 'khách hàng phản ánh',
        ];

        // Low priority keywords
        $lowKeywords = [
            'thấp', 'low', 'không gấp', 'có thể đợi', 'tương lai',
            'enhancement', 'cải tiến', 'đề xuất', 'suggestion',
        ];

        $urgentScore = $this->countKeywordMatches($text, $urgentKeywords);
        $highScore = $this->countKeywordMatches($text, $highKeywords);
        $lowScore = $this->countKeywordMatches($text, $lowKeywords);

        if ($urgentScore > 0) {
            return 'urgent';
        } elseif ($highScore > 0) {
            return 'high';
        } elseif ($lowScore > 0) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Count keyword matches in text
     */
    protected function countKeywordMatches(string $text, array $keywords): int
    {
        $count = 0;
        foreach ($keywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Get automation statistics
     */
    public function getAutomationStats(): array
    {
        $totalRules = AutomationRule::count();
        $activeRules = AutomationRule::active()->count();
        $totalMatches = AutomationRule::sum('matched_count');

        $recentMatches = AutomationRule::where('last_matched_at', '>=', now()->subDays(7))
            ->sum('matched_count');

        $topRules = AutomationRule::orderBy('matched_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'matched_count']);

        return [
            'total_rules' => $totalRules,
            'active_rules' => $activeRules,
            'total_matches' => $totalMatches,
            'recent_matches' => $recentMatches,
            'top_rules' => $topRules,
        ];
    }

    /**
     * Bulk update priority scores for existing posts
     */
    public function bulkUpdatePriorityScores(): int
    {
        $posts = Post::whereNull('priority_score')
            ->orWhere('priority_score', 0)
            ->get();

        $updated = 0;
        foreach ($posts as $post) {
            $post->updatePriorityScore();
            $updated++;
        }

        return $updated;
    }
}
