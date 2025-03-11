<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Post;
use App\Notifications\NewPostNotification;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
   ->middleware('auth')
   ->name('notifications.read_all');

Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/notifications/read-all', function () {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['message' => 'Đã đánh dấu tất cả là đã đọc']);
    });

    Route::post('/notifications/{id}/read', function ($id) {
        auth()->user()->notifications()->findOrFail($id)->markAsRead();
        return response()->json(['message' => 'Đã đánh dấu là đã đọc']);
    });
});
Route::get('categories', [CategoryController::class, 'index']);
Route::get('count', [PostController::class, 'getCountPost']);

Route::get('/test-notification', function () {
    $user = User::find(1); // User ID cần tồn tại
    $post = Post::find("01jnz291ec0j11gj752pgk2mc4"); // Post ID cần tồn tại

    if (!$user || !$post) {
        return response()->json(['error' => 'User hoặc Post không tồn tại'], 404);
    }

    $user->notify(new NewPostNotification($post));
    return response()->json(['message' => 'Thông báo đã được gửi!']);
});