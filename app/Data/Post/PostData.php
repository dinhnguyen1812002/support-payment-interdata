<?php

namespace App\Data\Post;

use Spatie\LaravelData\Data;
use Illuminate\Support\Carbon;

class PostData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public string $content,
        public int $upvotes_count,
        public Carbon $created_at,
        public ?string $author_name,
    ) {}

    public static function fromModel(\App\Models\Post $post): self
    {
        return new self(
            id: $post->id,
            title: $post->title,
            content: $post->content,
            upvotes_count: $post->upvotes_count,
            created_at: $post->created_at,
            author_name: $post->user?->name
        );
    }
}

