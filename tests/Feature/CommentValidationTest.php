<?php

namespace Tests\Feature;

use App\Models\Comments;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $post;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->post = Post::factory()->create();
    }

    /** @test */
    public function it_validates_comment_minimum_length()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'Hi', // Only 2 characters
                'post_id' => $this->post->id,
            ])
            ->assertSessionHasErrors(['comment']);
    }

    /** @test */
    public function it_validates_comment_maximum_length()
    {
        $longComment = str_repeat('a', 1001); // 1001 characters

        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => $longComment,
                'post_id' => $this->post->id,
            ])
            ->assertSessionHasErrors(['comment']);
    }

    /** @test */
    public function it_validates_comment_contains_alphanumeric_characters()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => '!@#$%^&*()', // Only special characters
                'post_id' => $this->post->id,
            ])
            ->assertSessionHasErrors(['comment']);
    }

    /** @test */
    public function it_detects_spam_patterns()
    {
        // Test repeated characters
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'aaaaaaaaaa', // Repeated characters
                'post_id' => $this->post->id,
            ])
            ->assertSessionHasErrors(['comment']);
    }

    /** @test */
    public function it_prevents_rate_limiting()
    {
        // First comment should succeed
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'First comment',
                'post_id' => $this->post->id,
            ])
            ->assertRedirect();

        // Second comment immediately should fail due to rate limiting
        $response = $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'Second comment',
                'post_id' => $this->post->id,
            ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /** @test */
    public function it_allows_valid_comments()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'This is a valid comment with proper length and content.',
                'post_id' => $this->post->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('comments', [
            'comment' => 'This is a valid comment with proper length and content.',
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_validates_post_exists()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'Valid comment',
                'post_id' => 99999, // Non-existent post
            ])
            ->assertSessionHasErrors(['post_id']);
    }

    /** @test */
    public function it_validates_parent_comment_exists()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'Valid reply',
                'post_id' => $this->post->id,
                'parent_id' => 99999, // Non-existent parent comment
            ])
            ->assertSessionHasErrors(['parent_id']);
    }

    /** @test */
    public function it_allows_replies_to_existing_comments()
    {
        $parentComment = Comments::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => 'This is a valid reply',
                'post_id' => $this->post->id,
                'parent_id' => $parentComment->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('comments', [
            'comment' => 'This is a valid reply',
            'post_id' => $this->post->id,
            'parent_id' => $parentComment->id,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $this->post('/comments', [
            'comment' => 'Valid comment',
            'post_id' => $this->post->id,
        ])
        ->assertStatus(401); // Unauthorized
    }

    /** @test */
    public function it_sanitizes_comment_content()
    {
        $this->actingAs($this->user)
            ->post('/comments', [
                'comment' => '   This   has   extra   spaces   ',
                'post_id' => $this->post->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('comments', [
            'comment' => 'This has extra spaces', // Sanitized
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
        ]);
    }
}
