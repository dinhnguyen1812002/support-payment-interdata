<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Post::class;

    public function definition(): array
    {

        $title = $this->faker->sentence;

        return [
            'title' => $title,
            'content' => $this->faker->paragraphs(3, true),
            'user_id' => User::factory(),
            'is_published' => $this->faker->boolean,
            'slug' => Str::slug($title),
            'image' => $this->faker->imageUrl(),
            'deleted_at' => null,
        ];
    }
}
