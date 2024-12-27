<?php

namespace App\Data\Category;

use Spatie\LaravelData\Attributes\Validation\Rule;
use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        #[Rule('required|string')]
        public string $title,
        #[Rule('required|string')]
        public ?string $description = null,
    ) {}
}
