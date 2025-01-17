<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
//Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
//    ->middleware('auth')
//    ->name('notifications.read_all');
