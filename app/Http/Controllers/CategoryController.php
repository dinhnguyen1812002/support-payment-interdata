<?php

namespace App\Http\Controllers;

use App\Data\Category\CategoryData;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $categories = Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryData $request)
    {
        $categoryData = CategoryData::from($request);
        $category = Category::create([
            'title' => $categoryData->title,
            'slug' => $postData->slug ?? Str::slug($categoryData->title),
            'description' => $categoryData->description,
        ]);

        return redirect()->route('admin.categories');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        // Xác thực dữ liệu đầu vào
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,'.$category->id,
            'description' => 'nullable|string',
        ]);

        // Cập nhật danh mục
        $category->update($validated);

        // Chuyển hướng về trang danh sách với thông báo thành công
        return Redirect::route('admin.categories')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Xóa danh mục
        $category->delete();

        // Chuyển hướng về trang danh sách với thông báo thành công
        return Redirect::route('admin.categories')->with('success', 'Category deleted successfully.');
    }
}
