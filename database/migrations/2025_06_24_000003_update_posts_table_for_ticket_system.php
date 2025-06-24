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
        Schema::table('posts', function (Blueprint $table) {
            // Cập nhật priority enum để có thêm 'urgent'
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->change();

            // Thêm các trường mới cho ticket system
            $table->enum('category_type', ['technical', 'payment', 'consultation', 'general'])->default('general')->after('priority');
            $table->integer('priority_score')->default(50)->after('category_type'); // 0-100 scale
            $table->json('automation_applied')->nullable()->after('priority_score'); // Track which rules were applied
            $table->timestamp('auto_assigned_at')->nullable()->after('automation_applied');
            $table->foreignId('auto_assigned_by_rule_id')->nullable()->constrained('automation_rules')->onDelete('set null')->after('auto_assigned_at');

            // Index for performance
            $table->index(['category_type', 'priority']);
            $table->index(['priority_score', 'status']);
            $table->index('auto_assigned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['category_type', 'priority']);
            $table->dropIndex(['priority_score', 'status']);
            $table->dropIndex('auto_assigned_at');

            $table->dropForeign(['auto_assigned_by_rule_id']);
            $table->dropColumn([
                'category_type',
                'priority_score',
                'automation_applied',
                'auto_assigned_at',
                'auto_assigned_by_rule_id',
            ]);

            // Revert priority enum
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->change();
        });
    }
};
