<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
//    ->middleware('auth')
//    ->name('notifications.read_all');

// Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);

Route::get('cate', [CategoryController::class, 'index']);
Route::get('count', [PostController::class, 'count']);
