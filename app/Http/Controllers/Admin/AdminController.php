<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminService;
use App\Services\CategoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    use AuthorizesRequests;

    protected AdminService $adminService;

    protected CategoryService $categoryService;

    public function __construct(AdminService $AdminService, CategoryService $categoryService)
    {
        $this->adminService = $AdminService;
        $this->categoryService = $categoryService;
    }

    public function dashboard()
    {
        $this->authorize('view admin dashboard');

        $data = $this->adminService->getDashboardData(auth()->user());

        return Inertia::render('Admin/Dashboard', $data);
    }

    public function getAllPost(Request $request)
    {
        $this->authorize('view posts');

        $perPage = $request->per_page ?? 10;
        $postData = $this->adminService->getAllPosts($request, $perPage);

        return Inertia::render('Admin/Post', $postData);
    }

    public function getAllCategory(Request $request)
    {
        $this->authorize('view admin dashboard');

        $perPage = $request->input('per_page', 10);
        $categoryData = $this->categoryService->getAllCategorise($request, $perPage);

        return Inertia::render('Admin/Categories', $categoryData);
    }
}
