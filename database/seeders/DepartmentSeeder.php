<?php

namespace Database\Seeders;

use App\Models\Departments;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Departments::create(['name' => 'Support', 'slug' => 'support']);
        Departments::create(['name' => 'Technical', 'slug' => 'technical']);
    }
}
