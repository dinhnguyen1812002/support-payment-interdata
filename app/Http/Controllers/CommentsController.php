<?php

namespace App\Http\Controllers;

use App\Events\NewCommentPosted;
use App\Models\Comments;
use App\Models\Post;
use App\Notifications\NewQuestionOrAnswerNotification;
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

        $comment->load(['user', 'replies.user']);

        $commentData = [
            'id' => $comment->id,
            'comment' => $comment->comment,
            'parent_id' => $comment->parent_id,
            'created_at' => $comment->created_at->toISOString(),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'profile_photo_path' => $comment->user->profile_photo_path,
            ],
            'replies' => [],
        ];

        $post = Post::find($request->post_id);
        if ($post && $post->user_id !== auth()->id()) {
            $post->user->notify(new NewQuestionOrAnswerNotification('answer', [
                'title' => $post->title,
                'url' => "/posts/{$post->slug}",
            ]));
        }
        broadcast(new NewCommentPosted($commentData));

        return back()->with('success', 'Comment added successfully!');
    }

    public function show(Post $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id') // Get only parent comments
            ->with(['user', 'replies.user'])
            ->latest()
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'comment' => $comment->comment,
                    'created_at' => $comment->created_at->toISOString(),
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'profile_photo_path' => $comment->user->profile_photo_path,
                    ],
                    'replies' => $comment->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'comment' => $reply->comment,
                            'created_at' => $reply->created_at->toISOString(),
                            'user' => [
                                'id' => $reply->user->id,
                                'name' => $reply->user->name,
                                'profile_photo_path' => $reply->user->profile_photo_path,
                            ],
                        ];
                    }),
                ];
            });

        return Inertia::render('Posts/PostDetail', [
            'post' => $post,
            'comments' => $comments,
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
