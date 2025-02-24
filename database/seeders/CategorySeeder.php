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
            //            [
            //                'title' => 'Technology',
            //                'slug' => 'technology',
            //                'description' => 'All about the latest technology trends and news.',
            //            ],
            //            [
            //                'title' => 'Lifestyle',
            //                'slug' => 'lifestyle',
            //                'description' => 'Tips and articles about lifestyle and personal development.',
            //            ],
            //            [
            //                'title' => 'Health',
            //                'slug' => 'health',
            //                'description' => 'Health tips and medical updates.',
            //            ],
            //            [
            //                'title' => 'Business',
            //                'slug' => 'business',
            //                'description' => 'Business news, strategies, and entrepreneurship.',
            //            ],
            //            [
            //                'title' => 'Test data',
            //                'slug' => 'test-data',
            //                'description' => 'Test data',
            //            ],
            [
                'title' => 'Education',
                'slug' => 'education',
                'description' => 'Latest trends and news in the education sector.',
            ],
            [
                'title' => 'Entertainment',
                'slug' => 'entertainment',
                'description' => 'Movies, music, and entertainment industry updates.',
            ],
            [
                'title' => 'Sports',
                'slug' => 'sports',
                'description' => 'Sports news, events, and highlights.',
            ],
            [
                'title' => 'Science',
                'slug' => 'science',
                'description' => 'Discoveries, innovations, and scientific research.',
            ],
            [
                'title' => 'Travel',
                'slug' => 'travel',
                'description' => 'Travel guides, tips, and destination reviews.',
            ],
            [
                'title' => 'Food',
                'slug' => 'food',
                'description' => 'Recipes, restaurant reviews, and cooking tips.',
            ],
            [
                'title' => 'Finance',
                'slug' => 'finance',
                'description' => 'Investment tips, market trends, and financial advice.',
            ],
            [
                'title' => 'Gaming',
                'slug' => 'gaming',
                'description' => 'Latest gaming news, reviews, and industry updates.',
            ],
            [
                'title' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Fashion trends, style tips, and industry news.',
            ],
            [
                'title' => 'Environment',
                'slug' => 'environment',
                'description' => 'Climate change, sustainability, and environmental awareness.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
