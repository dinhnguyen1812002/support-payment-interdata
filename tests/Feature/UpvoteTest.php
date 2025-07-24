<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostUpvote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpvoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upvote_a_post()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        $this->actingAs($user)
            ->post(route('posts.upvote', $post))
            ->assertRedirect();

        $this->assertDatabaseHas('post_upvotes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_user_can_remove_upvote_from_a_post()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        // First upvote
        PostUpvote::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $this->actingAs($user)
            ->post(route('posts.upvote', $post))
            ->assertRedirect();

        $this->assertDatabaseMissing('post_upvotes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_guest_cannot_upvote_a_post()
    {
        $post = Post::factory()->create();

        $this->post(route('posts.upvote', $post))
            ->assertRedirect('/login');

        $this->assertDatabaseCount('post_upvotes', 0);
    }

    public function test_post_upvote_count_is_calculated_correctly()
    {
        $post = Post::factory()->create();
        $users = User::factory()->count(3)->create();

        foreach ($users as $user) {
            PostUpvote::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        }

        $post->loadCount('upvotes');
        $this->assertEquals(3, $post->upvotes_count);
    }

    public function test_user_upvote_status_is_checked_correctly()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        // Initially not upvoted
        $this->assertFalse($post->isUpvotedBy($user->id));

        // After upvoting
        PostUpvote::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $this->assertTrue($post->isUpvotedBy($user->id));
    }

    public function test_upvote_data_is_included_in_formatted_array()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create();

        // Create some upvotes
        PostUpvote::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $post->loadCount('upvotes');
        
        $this->actingAs($user);
        $formattedArray = $post->toFormattedArray();

        $this->assertArrayHasKey('upvote_count', $formattedArray);
        $this->assertArrayHasKey('has_upvote', $formattedArray);
        $this->assertEquals(1, $formattedArray['upvote_count']);
        $this->assertTrue($formattedArray['has_upvote']);
    }
}
