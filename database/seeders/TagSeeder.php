<?php

namespace Database\Seeders;

use App\Models\tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tag = [
            'Feature request',
            'Bug report',
            'Question',
            'Discussion',
            'Other',
        ];
        foreach ($tag as $item) {
            Tag::firstOrCreate([
                'name' => $item,
                'slug' => Str::slug($item),
            ]);
        }
    }
}
