<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UpvoteController;
use Illuminate\Support\Facades\Route;

// Homepage
Route::get('/', [PostController::class, 'index'])->name('/');
Route::get('/posts', [PostController::class, 'getPostByUser']);
Route::middleware(['auth'])->group(function () {
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/new-post', [PostController::class, 'store'])->name('posts.store');

    Route::get('/posts/{slug}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/comments', [CommentsController::class, 'store'])->name('comments.store');

    // Nếu bạn muốn thêm routes cho reply comments
    Route::post('/comments/{comment}/reply', [CommentsController::class, 'reply'])->name('comments.reply');

});
Route::get('/posts/search', [PostController::class, 'search'])->name('posts.search');
Route::get('/categories/{categorySlug}/posts', [PostController::class, 'filterPostByCategory'])
    ->name('categories.posts.index');
Route::get('/posts/{slug}', [PostController::class, 'show'])->name('posts.show');

Route::post('/posts/{post}/upvote', [UpvoteController::class, 'upvote'])
    ->name('posts.upvote');
Route::delete('/comments/{comment}', [CommentsController::class, 'destroy'])
    ->middleware(['auth:sanctum'])
    ->name('comments.destroy');

Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
    ->middleware('auth')
    ->name('notifications.read_all');
Route::get('/send-email', [\Illuminate\Notifications\Notification::class, 'sendEmailNotification']);

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return redirect('/');
    })->name('dashboard');
});
Route::get('/user/profile', [\App\Http\Controllers\UserController::class, 'show'])
    ->name('profile.show')
    ->middleware(['auth', 'verified']);
