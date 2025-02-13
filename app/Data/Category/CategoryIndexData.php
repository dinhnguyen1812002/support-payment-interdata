<?php

namespace App\Data\Category;

use Spatie\LaravelData\Data;

class CategoryIndexData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        public int $posts_count
    ) {}
}
