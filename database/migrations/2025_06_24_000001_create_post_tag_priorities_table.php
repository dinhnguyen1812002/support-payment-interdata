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
        Schema::create('post_tag_priorities', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->integer('priority_score')->default(50); // 0-100 scale
            $table->json('automation_rules')->nullable(); // Store specific rules for this combination
            $table->timestamps();

            // Prevent duplicates
            $table->unique(['post_id', 'tag_id']);

            // Index for performance
            $table->index(['priority', 'priority_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_tag_priorities');
    }
};
