<?php

namespace Database\Seeders;

use App\Models\AutomationRule;
use App\Models\Category;
use App\Models\Departments;
use Illuminate\Database\Seeder;

class AutomationRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some categories and tags for rules
        $technicalCategory = Category::where('title', 'like', '%technical%')->first();
        $paymentCategory = Category::where('title', 'like', '%payment%')->first();
        $supportDepartment = Departments::where('name', 'like', '%support%')->first();

        // Rule 1: Technical Issues - High Priority
        AutomationRule::create([
            'name' => 'Technical Issues - High Priority',
            'description' => 'Automatically categorize and prioritize technical issues',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['lỗi', 'bug', 'error', 'không hoạt động', 'crash', 'technical'],
                'content_keywords' => ['api', 'database', 'server', 'code', 'integration'],
                'category_ids' => $technicalCategory ? [$technicalCategory->id] : [],
            ],
            'actions' => [
                'set_priority' => 'high',
                'set_category' => 'technical',
                'notify_department' => true,
            ],
            'category_type' => 'technical',
            'assigned_priority' => 'high',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 10,
        ]);

        // Rule 2: Payment Issues - Urgent Priority
        AutomationRule::create([
            'name' => 'Payment Issues - Urgent Priority',
            'description' => 'Automatically handle payment-related issues with urgent priority',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['thanh toán', 'payment', 'billing', 'invoice', 'refund'],
                'content_keywords' => ['tiền', 'money', 'charge', 'subscription', 'hoàn tiền'],
                'category_ids' => $paymentCategory ? [$paymentCategory->id] : [],
            ],
            'actions' => [
                'set_priority' => 'urgent',
                'set_category' => 'payment',
                'notify_finance' => true,
            ],
            'category_type' => 'payment',
            'assigned_priority' => 'urgent',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 5,
        ]);

        // Rule 3: Consultation Requests - Medium Priority
        AutomationRule::create([
            'name' => 'Consultation Requests',
            'description' => 'Handle consultation and support requests',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['tư vấn', 'consultation', 'help', 'support', 'hướng dẫn'],
                'content_keywords' => ['hỏi', 'question', 'guide', 'how to', 'cách'],
            ],
            'actions' => [
                'set_priority' => 'medium',
                'set_category' => 'consultation',
                'assign_to_support' => true,
            ],
            'category_type' => 'consultation',
            'assigned_priority' => 'medium',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 20,
        ]);

        // Rule 4: Urgent Keywords - Immediate Escalation
        AutomationRule::create([
            'name' => 'Urgent Keywords - Immediate Escalation',
            'description' => 'Detect urgent situations and escalate immediately',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['khẩn cấp', 'urgent', 'emergency', 'critical', 'down'],
                'content_keywords' => ['ngay lập tức', 'gấp', 'mất dữ liệu', 'data loss', 'không thể'],
            ],
            'actions' => [
                'set_priority' => 'urgent',
                'notify_admin' => true,
                'escalate' => true,
            ],
            'category_type' => 'general',
            'assigned_priority' => 'urgent',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 1,
        ]);

        // Rule 5: Low Priority - Enhancement Requests
        AutomationRule::create([
            'name' => 'Enhancement Requests - Low Priority',
            'description' => 'Handle feature requests and enhancements',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['enhancement', 'feature', 'improvement', 'đề xuất', 'cải tiến'],
                'content_keywords' => ['suggestion', 'tương lai', 'có thể', 'nên có', 'would be nice'],
            ],
            'actions' => [
                'set_priority' => 'low',
                'set_category' => 'general',
                'add_to_backlog' => true,
            ],
            'category_type' => 'general',
            'assigned_priority' => 'low',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 50,
        ]);

        // Rule 6: VIP Customer - High Priority
        AutomationRule::create([
            'name' => 'VIP Customer Priority',
            'description' => 'Give high priority to VIP customer requests',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['vip', 'premium', 'enterprise', 'priority customer'],
                'content_keywords' => ['khách hàng quan trọng', 'doanh nghiệp lớn', 'hợp đồng lớn'],
            ],
            'actions' => [
                'set_priority' => 'high',
                'notify_manager' => true,
                'fast_track' => true,
            ],
            'category_type' => 'general',
            'assigned_priority' => 'high',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 8,
        ]);

        // Rule 7: Security Issues - Urgent Priority
        AutomationRule::create([
            'name' => 'Security Issues - Urgent Priority',
            'description' => 'Handle security-related issues with highest priority',
            'is_active' => true,
            'conditions' => [
                'title_keywords' => ['security', 'bảo mật', 'hack', 'breach', 'vulnerability'],
                'content_keywords' => ['password', 'login', 'unauthorized', 'suspicious', 'malware'],
            ],
            'actions' => [
                'set_priority' => 'urgent',
                'set_category' => 'technical',
                'notify_security_team' => true,
                'escalate_immediately' => true,
            ],
            'category_type' => 'technical',
            'assigned_priority' => 'urgent',
            'assigned_department_id' => $supportDepartment?->id,
            'execution_order' => 2,
        ]);
    }
}
