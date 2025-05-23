<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function globleSearch(Request $request)
    {
        // Validate the search query
        $request->validate([
            'query' => 'nullable|string|max:255',
        ]);

        // If no query, return empty results
        if (! $request->filled('query')) {
            return response()->json([
                'results' => [],
                'total' => 0,
            ]);
        }
        // Perform search across multiple fields
        $query = $request->input('query');
        $results = Post::where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%$query%")
            ->limit(10)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'excerpt' => \Str::limit($post->content, 100),
                    'url' => route('posts.show', $post->slug),
                    'create_at' => $post->created_at->toDateTimeString(), // Chuyển đổi format date
                ];
            });

        return response()->json([
            'results' => $results,
            'total' => $results->count(),
        ]);
    }
}
