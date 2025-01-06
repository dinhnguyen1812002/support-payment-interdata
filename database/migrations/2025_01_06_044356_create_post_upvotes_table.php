<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('post_upvotes', function (Blueprint $table) {
            $table->ulid('id')->primary(); // ULID làm khóa chính
            $table->foreignIdFor(User::class)->constrained()->onDelete('cascade'); // Khóa ngoại tới users
            $table->foreignIdFor(Post::class)->constrained()->onDelete('cascade'); // Khóa ngoại tới posts
            $table->timestamps();

            // Ràng buộc unique trên cặp (user_id, post_id)
            $table->unique(['user_id', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_upvotes');
    }
};
