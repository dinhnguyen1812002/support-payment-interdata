<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read.'
            ], 500);
        }
    }



    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
