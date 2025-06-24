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
        Schema::table('categories', function (Blueprint $table) {
            $table->enum('type', ['technical', 'payment', 'consultation', 'general'])->default('general')->after('description');
            $table->boolean('is_active')->default(true)->after('type');
            $table->integer('sort_order')->default(0)->after('is_active');
            
            // Index for performance
            $table->index(['type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['type', 'is_active']);
            $table->dropColumn(['type', 'is_active', 'sort_order']);
        });
    }
};
