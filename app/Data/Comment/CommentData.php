<?php

namespace App\Data\Comment;

use Spatie\LaravelData\Data;

class CommentData extends Data
{
    public function __construct(
        public string $comment,
        public int $post_id,
        public int $user_id,
        public ?int $parent_id = null
    ) {}

    public static function rules(): array
    {
        return [
            'comment' => 'required|string|max:1000',
            'post_id' => 'required|exists:posts,id',
            'user_id' => 'required|exist:user,id',
            'parent_id' => 'nullable|exists:comments,id',
        ];
    }
}
