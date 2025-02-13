<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'title' => 'Technology',
                'slug' => 'technology',
                'description' => 'All about the latest technology trends and news.',
            ],
            [
                'title' => 'Lifestyle',
                'slug' => 'lifestyle',
                'description' => 'Tips and articles about lifestyle and personal development.',
            ],
            [
                'title' => 'Health',
                'slug' => 'health',
                'description' => 'Health tips and medical updates.',
            ],
            [
                'title' => 'Business',
                'slug' => 'business',
                'description' => 'Business news, strategies, and entrepreneurship.',
            ],
            [
                'title' => 'Test data',
                'slug' => 'Test-data',
                'description' => 'Test data',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
