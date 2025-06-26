<?php

namespace Tests\Feature;

use App\Models\AutomationRule;
use App\Models\Post;
use App\Models\User;
use App\Services\TicketAutomationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketAutomationTest extends TestCase
{
    use RefreshDatabase;

    protected TicketAutomationService $automationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->automationService = app(TicketAutomationService::class);
    }

    public function test_categorize_technical_post(): void
    {
        $post = (object) [
            'title' => 'API lỗi không hoạt động',
            'content' => 'Server trả về error 500, cần khắc phục technical issue này',
        ];

        $category = $this->automationService->categorizePost($post);

        $this->assertEquals('technical', $category);
    }

    public function test_categorize_payment_post(): void
    {
        $post = (object) [
            'title' => 'Thanh toán bị lỗi',
            'content' => 'Khách hàng không thể payment, billing system có vấn đề',
        ];

        $category = $this->automationService->categorizePost($post);

        $this->assertEquals('payment', $category);
    }

    public function test_calculate_urgent_priority(): void
    {
        $post = (object) [
            'title' => 'Khẩn cấp: Hệ thống down',
            'content' => 'Critical error, cần xử lý urgent ngay lập tức',
        ];

        $priority = $this->automationService->calculatePriority($post);

        $this->assertEquals('urgent', $priority);
    }

    public function test_calculate_low_priority(): void
    {
        $post = (object) [
            'title' => 'Đề xuất enhancement',
            'content' => 'Suggestion cho tính năng mới, không gấp, có thể đợi',
        ];

        $priority = $this->automationService->calculatePriority($post);

        $this->assertEquals('low', $priority);
    }

    public function test_automation_rule_matching(): void
    {
        // Create a user
        $user = User::factory()->create();

        // Create an automation rule
        $rule = AutomationRule::create([
            'name' => 'Test Technical Rule',
            'description' => 'Test rule for technical issues',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['lỗi', 'bug'],
                'content_keywords' => ['api', 'server'],
            ],
            'actions' => [],
            'category_type' => 'technical',
            'assigned_priority' => 'high',
            'execution_order' => 10,
        ]);

        // Create a post that should match the rule
        $post = Post::create([
            'title' => 'Lỗi API server',
            'content' => 'API endpoint bị lỗi, server không phản hồi',
            'slug' => 'loi-api-server',
            'user_id' => $user->id,
            'is_published' => true,
            'status' => 'open',
        ]);

        // Test if rule matches
        $this->assertTrue($rule->matchesPost($post));

        // Apply automation rules
        $this->automationService->applyAutomationRules($post);

        // Refresh post to get updated data
        $post->refresh();

        // Assert automation was applied
        $this->assertEquals('technical', $post->category_type);
        $this->assertEquals('high', $post->priority);
        $this->assertNotNull($post->auto_assigned_at);
        $this->assertEquals($rule->id, $post->auto_assigned_by_rule_id);
    }

    public function test_priority_score_calculation(): void
    {
        $user = User::factory()->create();

        $post = Post::create([
            'title' => 'Test Post',
            'content' => 'Test content',
            'slug' => 'test-post',
            'user_id' => $user->id,
            'priority' => 'high',
            'is_published' => true,
        ]);

        $score = $post->calculatePriorityScore();

        // High priority should have score around 75
        $this->assertGreaterThanOrEqual(70, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_automation_stats(): void
    {
        // Create some automation rules
        AutomationRule::factory()->count(3)->create([
            'is_active' => true,
            'matched_count' => 5,
        ]);

        AutomationRule::factory()->count(2)->create([
            'is_active' => false,
            'matched_count' => 2,
        ]);

        $stats = $this->automationService->getAutomationStats();

        $this->assertEquals(5, $stats['total_rules']);
        $this->assertEquals(3, $stats['active_rules']);
        $this->assertEquals(19, $stats['total_matches']); // 3*5 + 2*2
    }
}
