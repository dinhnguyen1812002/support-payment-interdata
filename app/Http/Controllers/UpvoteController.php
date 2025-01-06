<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostUpvote;
use Illuminate\Support\Facades\Auth;

class UpvoteController extends Controller
{
    //
    public function upvote(Post $post)
    {
        $user = Auth::user();

        // Kiểm tra nếu user đã upvote
        $alreadyUpvote = PostUpvote::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyUpvote) {
            // Nếu đã upvote, thì xóa upvote
            PostUpvote::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->delete();

            return redirect()->back()->with('message', 'Upvote removed.');
        }

        // Nếu chưa upvote, thì thêm upvote
        PostUpvote::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with('message', 'Upvote added.');
    }
}
