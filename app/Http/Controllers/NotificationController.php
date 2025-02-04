<?php

namespace App\Http\Controllers;

use App\Mail\UserNotificationMail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{


    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
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
        Mail:to($user->email)->send(new UserNotificationMail($details));

        return back()->with('success', 'Email sent successfully!');
    }
}
