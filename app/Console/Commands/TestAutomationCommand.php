<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\User;
use App\Services\TicketAutomationService;
use Illuminate\Console\Command;

class TestAutomationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'automation:test {--create-sample : Create sample posts for testing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the ticket automation system';

    protected TicketAutomationService $automationService;

    public function __construct(TicketAutomationService $automationService)
    {
        parent::__construct();
        $this->automationService = $automationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Ticket Automation System');
        $this->newLine();

        if ($this->option('create-sample')) {
            $this->createSamplePosts();
        }

        $this->showAutomationStats();
        $this->testAutomationRules();

        return 0;
    }

    protected function createSamplePosts()
    {
        $this->info('Creating sample posts for testing...');

        $user = User::first();
        if (! $user) {
            $this->error('No users found. Please create a user first.');

            return;
        }

        $samplePosts = [
            [
                'title' => 'Lỗi API không hoạt động',
                'content' => 'API endpoint /api/users trả về lỗi 500. Cần khắc phục gấp vì ảnh hưởng đến production.',
                'expected_category' => 'technical',
                'expected_priority' => 'high',
            ],
            [
                'title' => 'Khẩn cấp: Thanh toán bị lỗi',
                'content' => 'Khách hàng không thể thanh toán, mất tiền nhưng không nhận được dịch vụ. Cần xử lý ngay lập tức.',
                'expected_category' => 'payment',
                'expected_priority' => 'urgent',
            ],
            [
                'title' => 'Tư vấn về tính năng mới',
                'content' => 'Tôi muốn hỏi về cách sử dụng tính năng báo cáo mới. Có hướng dẫn chi tiết không?',
                'expected_category' => 'consultation',
                'expected_priority' => 'medium',
            ],
            [
                'title' => 'Đề xuất cải tiến giao diện',
                'content' => 'Tôi nghĩ giao diện có thể được cải thiện bằng cách thêm dark mode. Đây chỉ là suggestion.',
                'expected_category' => 'general',
                'expected_priority' => 'low',
            ],
        ];

        foreach ($samplePosts as $postData) {
            $post = Post::create([
                'title' => $postData['title'],
                'content' => $postData['content'],
                'slug' => \Illuminate\Support\Str::slug($postData['title']),
                'user_id' => $user->id,
                'is_published' => true,
                'status' => 'open',
            ]);

            // Apply automation
            $this->automationService->applyAutomationRules($post);

            $post->refresh();

            $this->line("Created: {$post->title}");
            $this->line("  Expected: {$postData['expected_category']} / {$postData['expected_priority']}");
            $this->line("  Actual: {$post->category_type} / {$post->priority}");
            $this->line("  Score: {$post->priority_score}");

            if ($post->category_type === $postData['expected_category'] && $post->priority === $postData['expected_priority']) {
                $this->info('  ✅ Automation worked correctly!');
            } else {
                $this->warn('  ⚠️  Automation may need adjustment');
            }
            $this->newLine();
        }
    }

    protected function showAutomationStats()
    {
        $this->info('Automation Statistics:');
        $stats = $this->automationService->getAutomationStats();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Rules', $stats['total_rules']],
                ['Active Rules', $stats['active_rules']],
                ['Total Matches', $stats['total_matches']],
                ['Recent Matches (7 days)', $stats['recent_matches']],
            ]
        );

        if (! empty($stats['top_rules'])) {
            $this->info('Top Performing Rules:');
            $this->table(
                ['Rule Name', 'Matches'],
                collect($stats['top_rules'])->map(fn ($rule) => [$rule['name'], $rule['matched_count']])->toArray()
            );
        }
    }

    protected function testAutomationRules()
    {
        $this->info('Testing individual automation functions...');

        // Test categorization
        $testPost = (object) [
            'title' => 'API lỗi không thể kết nối database',
            'content' => 'Server trả về error 500, cần khắc phục technical issue này gấp',
        ];

        $category = $this->automationService->categorizePost($testPost);
        $priority = $this->automationService->calculatePriority($testPost);

        $this->line("Test Post: {$testPost->title}");
        $this->line("Detected Category: {$category}");
        $this->line("Detected Priority: {$priority}");
        $this->newLine();
    }
}
