<?php

namespace App\Data\Comment;

use Spatie\LaravelData\Data;

class CommentData extends Data
{
    public function __construct(
        public string $content,
        public ?int $parent_id,
        public int $post_id,
        public int $user_id,
    ) {}
}
