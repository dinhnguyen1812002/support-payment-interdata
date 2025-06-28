<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            $notification->markAsRead();

            return back();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to mark notification as read.');
        }
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $limit = $request->input('limit', 10);

            // Get both read and unread notifications, with unread first
            
            $notifications = $user->notifications()
                ->orderByRaw('read_at IS NULL DESC') // Unread first
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => class_basename($notification->type),
                        'data' => $notification->data,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at->diffForHumans(),
                        'time' => $notification->created_at->diffForHumans(),
                    ];
                });

            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getNotification()
    {
        $notify = Notification::all();

        return response()->json($notify);
    }

    /**
     * Delete a specific notification
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);

            $notification->delete();

            return redirect()->back()->with('success', 'Notification deleted successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete notification.');

        }
    }

    public function getDepartmentNotification($departmentId)
    {
        $notify = Notification::where('department_id', $departmentId)->get();

        return response()->json($notify);
    }
}

