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

        // Kiểm tra user đã đăng nhập chưa
        if (! $user) {
            return redirect('/login')->with('error', 'Please login to upvote.');
        }

        // Tìm bản ghi upvote hiện có
        $upvote = PostUpvote::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($upvote) {
            // Nếu đã upvote thì xóa
            $upvote->delete();

            return redirect()->back()->with('message', 'Upvote removed successfully.');
        }

        // Thêm upvote mới
        PostUpvote::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with('message', 'Upvote added successfully.');
    }
}
