<?php

namespace App\Http\Controllers;

use App\Events\NewCommentPosted;
use App\Models\Comments;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CommentsController extends Controller
{
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

        // Broadcast the event
        event(new NewCommentPosted($comment));

        return back()->with('success', 'Comment added successfully!');
    }

    public function show(Post $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(5); // Sử dụng paginate()
        event(new NewCommentPosted($comments));

        return Inertia::render('Posts/PostDetail', [
            'post' => $post,
            'comments' => [
                'data' => $comments->items(),
                'next_page_url' => $comments->nextPageUrl(),
            ],
        ]);
    }

    public function destroy(Comments $comment)
    {
        if (! Gate::allows('delete-comment', $comment)) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        return redirect()->back()->with('success', 'Comment deleted successfully!');
    }
}
