<?php

namespace App\Http\Controllers;

use App\Models\Comments;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CommentsController extends Controller
{
    //
    public function store(Request $request)
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
            'post_id' => 'required|exists:posts,id',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comments::create([
            'comment' => $validated['comment'],
            'post_id' => $validated['post_id'],
            'user_id' => auth()->id(),
            'parent_id' => $validated['parent_id'],
        ]);

        // Load relationships cho comment mới
        $comment->load(['user', 'replies.user']);

        // Format comment data
        $commentData = [
            'id' => $comment->id,
            'comment' => $comment->content,
            'created_at' => $comment->created_at,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'profile_photo_path' => $comment->user->profile_photo_path,
            ],
            'replies' => [],
        ];

        return back()->with([
            'success' => 'Comment added successfully!',
            'comment' => $commentData,
        ]);
    }

    public function show(Post $post)
    {
        $comments = $post->comments()->with(['replies.user', 'user'])->get();

        return Inertia::render('Posts/PostDetail', [
            'post' => $post,
            'comments' => $comments,
        ]);
    }

    public function destroy(Comments $comment)
    {

        // Check if user is authorized to delete this comment
        if (! Gate::allows('delete-comment', $comment)) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        return redirect()->back()->with('success', 'Comment deleted successfully!');
    }
}
