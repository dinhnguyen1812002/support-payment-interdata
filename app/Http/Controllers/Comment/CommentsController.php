<?php

namespace App\Http\Controllers\Comment;

use App\Events\CommentPosted;
use App\Events\NewCommentCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Comments;
use App\Models\Post;
use App\Notifications\NewCommentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CommentsController extends Controller
{
    public function store(StoreCommentRequest $request)
    {
        \Log::info('Comment store request received', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        $validated = $request->validated();

        // Check if user is HR staff and set is_hr_response flag
        $isHrResponse = auth()->user()->departments->contains(function ($department) {
            return $department->name === 'HR' || $department->name === 'Human Resources';
        });

        $comment = Comments::create([
            'comment' => $validated['comment'],
            'post_id' => request()->post_id,
            'user_id' => auth()->id(),
            'parent_id' => $validated['parent_id'] ?? null,
            'is_hr_response' => $isHrResponse,
        ]);

        $comment->load(['user.roles', 'user.departments']);

        \Log::info('Comment created successfully', [
            'comment_id' => $comment->id,
            'user_id' => $comment->user_id,
            'post_id' => $comment->post_id
        ]);

        broadcast(new CommentPosted($comment))->toOthers();
        broadcast(new NewCommentCreated($comment))->toOthers();

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
            ->with([
                'user.roles',
                'user.departments',
                'replies.user.roles',
                'replies.user.departments',
            ])
            ->latest()
            ->paginate(5);

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
        if (Gate::denies('delete-comment', $comment)) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        return redirect()->back()->with('success', 'Comment deleted successfully!');
    }
}
