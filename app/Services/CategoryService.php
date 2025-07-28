<?php

namespace App\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function getAllCategorise(Request $request, int $perPage = 10): array
    {
        $categories = $this->getListCategories($request, $perPage);

        return [
            'data' => $this->transformCategories($categories),
            'pagination' => $this->formatPagination($categories),

        ];
    }

    private function getListCategories(Request $request, int $perPage): LengthAwarePaginator
    {
        $currentUser = auth()->user();
        $userDeptKey = $currentUser && !$currentUser->isAdmin() ?
            '_dept_' . $currentUser->departments()->pluck('departments.id')->implode('_') :
            '_all';

        $cacheKey = "categories_page_{$request->page}_perPage_{$perPage}_search_{$request->search}_sort_{$request->sort}_{$request->direction}{$userDeptKey}";
        $cacheDuration = now()->addMinutes(5);

        return Cache::remember($cacheKey, $cacheDuration, function () use ($request, $perPage, $currentUser) {
            $query = Category::select(['id', 'title', 'slug', 'description', 'logo']);

            // Lọc posts count theo phòng ban nếu user không phải admin
            if ($currentUser && !$currentUser->isAdmin()) {
                $departmentIds = $currentUser->departments()->pluck('departments.id');
                if ($departmentIds->isNotEmpty()) {
                    $query->withCount(['posts' => function ($q) use ($departmentIds) {
                        $q->whereIn('department_id', $departmentIds);
                    }]);
                } else {
                    $query->withCount(['posts' => function ($q) {
                        $q->whereRaw('1 = 0'); // No posts if user has no department
                    }]);
                }
            } else {
                $query->withCount('posts');
            }

            $query->latest();

            // Apply search filter if provided
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $searchTerm = '%'.$request->search.'%';
                    $q->where('title', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm);
                });
            }

            // Apply sorting
            if ($request->has('sort') && $request->has('direction')) {
                $query->orderBy($request->sort, $request->direction);
            } else {
                $query->orderBy('posts_count', 'desc');
            }

            return $query->paginate($perPage)->withQueryString();
        });
    }

    private function transformCategories(LengthAwarePaginator $categories): array
    {
        return $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'title' => $category->title,
                'slug' => $category->slug,
                'description' => $category->description,
                'logo' => $category->logo_url,
                'posts_count' => $category->posts_count,
            ];
        })->values()->all();
    }

    private function formatPagination(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'next_page_url' => $paginator->nextPageUrl(),
            'prev_page_url' => $paginator->previousPageUrl(),
        ];
    }
}
