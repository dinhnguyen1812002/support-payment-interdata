<?php

namespace App\Data\Post;

use Spatie\LaravelData\Data;

class CreateTicketData extends Data
{
    public function __construct(
        public string $title,
        public string $content,
        public bool $is_published,
        public ?string $slug = null,
        public ?array $categories = [],
        public ?array $tags = [],
        public ?int $department_id = null,
        public ?string $status = 'open',
        public ?string $priority = 'medium',
        public ?int $assignee_id = null,
    ) {}
}
