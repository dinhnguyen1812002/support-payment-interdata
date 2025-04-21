<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Departments::all();

        return Inertia::render('Department/Index', [
            'departments' => $departments,
        ]);
    }
}
