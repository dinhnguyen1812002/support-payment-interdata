<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPostPaginationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Tạo user admin
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /** @test */
    public function admin_can_view_paginated_posts()
    {
        // Tạo 25 posts để test phân trang
        Post::factory()->count(25)->create();

        $response = $this->actingAs($this->admin)
            ->get('/admin/posts?per_page=10');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Post')
            ->has('data', 10) // Kiểm tra có 10 items
            ->has('pagination.total', 25) // Tổng 25 items
            ->has('pagination.per_page', 10) // 10 items per page
            ->has('pagination.current_page', 1) // Trang hiện tại là 1
        );
    }

    /** @test */
    public function admin_can_search_posts()
    {
        Post::factory()->create(['title' => 'Laravel Tutorial']);
        Post::factory()->create(['title' => 'Vue.js Guide']);
        Post::factory()->create(['title' => 'React Basics']);

        $response = $this->actingAs($this->admin)
            ->get('/admin/posts?search=Laravel');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('data', 1)
            ->where('data.0.title', 'Laravel Tutorial')
        );
    }

    /** @test */
    public function admin_can_filter_posts_by_status()
    {
        Post::factory()->create(['is_published' => true]);
        Post::factory()->create(['is_published' => false]);
        Post::factory()->create(['is_published' => true]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/posts?status=published');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('data', 2)
        );
    }

    /** @test */
    public function admin_can_sort_posts()
    {
        $post1 = Post::factory()->create(['title' => 'A Post', 'created_at' => now()->subDays(2)]);
        $post2 = Post::factory()->create(['title' => 'B Post', 'created_at' => now()->subDays(1)]);
        $post3 = Post::factory()->create(['title' => 'C Post', 'created_at' => now()]);

        // Sort by title ascending
        $response = $this->actingAs($this->admin)
            ->get('/admin/posts?sort=title&direction=asc');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('data.0.title', 'A Post')
            ->where('data.1.title', 'B Post')
            ->where('data.2.title', 'C Post')
        );
    }

    /** @test */
    public function pagination_preserves_filters()
    {
        // Tạo nhiều posts với status khác nhau
        Post::factory()->count(15)->create(['is_published' => true]);
        Post::factory()->count(5)->create(['is_published' => false]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/posts?status=published&per_page=10&page=2');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('data', 5) // Trang 2 có 5 items còn lại
            ->where('pagination.current_page', 2)
            ->where('filters.status', 'published')
        );
    }
}
