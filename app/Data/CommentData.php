<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\Nullable;

class CommentData extends Data
{
    public function __construct(
        #[Required, Max(1000)]
        public string $comment,

        #[Required, Exists('posts', 'id')]
        public int $post_id,

        #[Nullable, Exists('comments', 'id')]
        public ?int $parent_id
    ) {}
}
