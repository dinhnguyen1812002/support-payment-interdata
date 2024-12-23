<?php

namespace App\Data\Post;

use Spatie\LaravelData\Attributes\Validation\Rule;
use Spatie\LaravelData\Data;

class PostData extends Data
{

    public function __construct(
        #[Rule('required|string|max:255')]
        public string $title,

        #[Rule('required|string')]
        public string $content,
        #[Rule('required|bool')]
        public bool $is_published,

        #[Rule('nullable|image')]
        public ?string $image = null,
    ) {}
}
