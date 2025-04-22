<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        // Kiểm tra vai trò admin
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $search = $request->input('search', '');

        $departments = Departments::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Departments/Index', [
            'departments' => [
                'data' => $departments->items(),
                'total' => $departments->total(),
                'per_page' => $departments->perPage(),
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'next_page_url' => $departments->nextPageUrl(),
                'prev_page_url' => $departments->previousPageUrl(),
            ],
            'keyword' => $search,
        ]);
    }

    public function create()
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        return Inertia::render('Departments/Create');
    }

    public function store(Request $request)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',

        ]);

        Departments::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('departments.index')->with('success', 'Department created successfully.');
    }
}
