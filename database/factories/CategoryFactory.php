<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition()
    {
        $title = $this->faker->word;

        return [
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->slug(3),
        ];
    }
}
