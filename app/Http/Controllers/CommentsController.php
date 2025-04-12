<?php

namespace App\Http\Controllers;

use App\Events\CommentPosted;
use App\Events\NewCommentCreated;
use App\Models\Comments;
use App\Models\Post;
use App\Notifications\NewCommentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CommentsController extends Controller
{
    //    public function store(CommentData $data)
    //    {
    //        $comment = Comments::create([
    //            'comment' => $data->comment,
    //            'post_id' => $data->post_id,
    //            'user_id' => auth()->id(),
    //            'parent_id' => $data->parent_id,
    //        ]);
    //        $post = Post::find($data->post_id);
    //        if ($post && $post->user_id !== auth()->id()) {
    //            $post->user->notify(new NewQuestionOrAnswerNotification('answer', [
    //                'title' => $post->title,
    //                'url' => "/posts/{$post->slug}",
    //            ]));
    //        }
    //
    //        return back()->with('success', 'Comment added successfully!');
    //    }

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
        $comment->load('user');
        // Broadcast the event
        broadcast(new CommentPosted($comment))->toOthers();
        broadcast(new NewCommentCreated($comment));
        $postOwner = $comment->post->user;
        if ($postOwner->id !== auth()->id()) {
            $postOwner->notify(new NewCommentNotification($comment));
        }

        return back()->with('success', 'Comment added successfully!');
    }

    public function show(Post $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(5); // Sử dụng paginate()

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
