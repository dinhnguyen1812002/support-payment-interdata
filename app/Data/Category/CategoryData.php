<?php

namespace App\Data\Category;

use Spatie\LaravelData\Attributes\Validation\Rule;
use Spatie\LaravelData\Data;
use Illuminate\Http\UploadedFile;

class CategoryData extends Data
{
    public function __construct(
        #[Rule('required|string')]
        public string $title,
        #[Rule('nullable|string')]
        public ?string $description = null,
        #[Rule('nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048')]
        public ?UploadedFile $logo = null,
        public ?string $slug = null,
    ) {}
}
