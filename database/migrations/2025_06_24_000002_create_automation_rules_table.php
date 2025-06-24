<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên rule
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            // Điều kiện trigger
            $table->json('conditions'); // Keywords, categories, tags, etc.

            // Hành động thực hiện
            $table->json('actions'); // Set priority, assign to department/user, add tags, etc.

            // Phân loại
            $table->enum('category_type', ['technical', 'payment', 'consultation', 'general'])->default('general');

            // Mức độ ưu tiên được gán
            $table->enum('assigned_priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Phòng ban được gán
            $table->foreignUlid('assigned_department_id')->nullable()->constrained('departments')->onDelete('set null');

            // Người được gán
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Thứ tự ưu tiên thực thi rule (số nhỏ hơn = ưu tiên cao hơn)
            $table->integer('execution_order')->default(100);

            // Thống kê
            $table->integer('matched_count')->default(0); // Số lần rule được áp dụng
            $table->timestamp('last_matched_at')->nullable();

            $table->timestamps();

            // Index for performance
            $table->index(['is_active', 'execution_order']);
            $table->index('category_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_rules');
    }
};
