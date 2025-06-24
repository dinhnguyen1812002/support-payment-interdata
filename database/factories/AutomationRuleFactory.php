<?php

namespace Database\Factories;

use App\Models\AutomationRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AutomationRule>
 */
class AutomationRuleFactory extends Factory
{
    protected $model = AutomationRule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'conditions' => [
                'title_keywords' => $this->faker->words(3),
                'content_keywords' => $this->faker->words(3),
            ],
            'actions' => [
                'set_priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
                'set_category' => $this->faker->randomElement(['technical', 'payment', 'consultation', 'general']),
            ],
            'category_type' => $this->faker->randomElement(['technical', 'payment', 'consultation', 'general']),
            'assigned_priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'execution_order' => $this->faker->numberBetween(1, 100),
            'matched_count' => $this->faker->numberBetween(0, 50),
            'last_matched_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the rule is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the rule is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
