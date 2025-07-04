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

    public function getDepartmentNotification(Request $request, $departmentId): \Illuminate\Http\JsonResponse
    {
        try {
            $user = Auth::user();

            // Ensure user can only access their department's notifications
            if ($user->department_id != $departmentId) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $notifications = $user->notifications()
                ->where('department_id', $departmentId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => class_basename($notification->type),
                        'data' => $notification->data,
                        'read_at' => $notification->read_at,
                        'time' => $notification->created_at->diffForHumans(),
                    ];
                });

            return response()->json($notifications);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve department notifications', [
                'department_id' => $departmentId,
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve department notifications',
            ], 500);
        }
    }
}
