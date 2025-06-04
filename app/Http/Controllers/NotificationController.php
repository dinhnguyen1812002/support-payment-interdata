<?php

namespace App\Http\Controllers;

use App\Mail\UserNotificationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    public function markAllAsRead()
    {
        $user = auth()->user();

        if ($user instanceof User) {
            // Mark all unread notifications as read
            $user->unreadNotifications->markAsRead();

            // Return updated notifications list to maintain state
            $allNotifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(50) // Limit to recent 50 notifications
                ->get();

            return response()->json([
                'message' => 'All notifications marked as read.',
                'notifications' => $allNotifications
            ]);
        }

        return response()->json([
            'message' => 'All notifications marked as read.',
            'notifications' => []
        ]);
    }

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

    public function sendEmailNotification(Request $request)
    {
        $user = auth()->user();
        $details = [
            'subject' => 'New Notification',
            'title' => 'Hello, '.$user->name,
            'body' => 'You have a new notification in your account.',
            'actionText' => 'View Notification',
            'actionUrl' => url('/notifications'),
        ];

        Mail::to($user->email)->send(new UserNotificationMail($details));

        return back()->with('success', 'Email sent successfully!');
    }

    public function sendNotification(Request $request)
    {
        $user = auth()->user();
        $data = [
            'message' => 'Bạn có một thông báo mới!',
            'url' => '/some-url',
            'type' => 'success',
            'user_id' => $user->id,
        ];

        return response()->json(['message' => 'Thông báo đã được gửi!']);
    }
}
