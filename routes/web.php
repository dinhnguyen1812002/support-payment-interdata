<?php

use App\Events\NewQuestionCreated;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\Department\DepartmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Oauth\SocialAuthController;
use App\Http\Controllers\Permission\PermissionController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Role\RoleController;
use App\Http\Controllers\UpvoteController;
use App\Http\Controllers\UserController;
use App\Models\Post;
use Illuminate\Support\Facades\Route;

// Homepage
Route::get('/', [PostController::class, 'index'])->name('/');
Route::get('/latest-posts', [PostController::class, 'getLatestPosts']);

// Route::get('/posts', [PostController::class, 'getPostByUser']);
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

Route::get('/tags/{tagsSlug}/posts', [PostController::class, 'filterPostByTag'])
    ->name('tags.posts.index');

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
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/permissions', [PermissionController::class, 'index'])
        ->name('permissions.index')
        ->middleware(['auth:sanctum', 'verified']);
    Route::post('/users/assign-permissions', [PermissionController::class, 'assignPermissions'])
        ->name('users.assignPermissions');
    Route::get('/roles', [RoleController::class, 'index'])
        ->name('roles.index');
    Route::post('/users/assign-role', [RoleController::class, 'assignRole'])
        ->name('users.assign-role');
    Route::get('/admin/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/posts', [AdminController::class, 'getAllPost'])->name('admin.posts');
    Route::get('/admin/categories', [AdminController::class, 'getAllCategory'])->name('admin.categories');
    Route::post('/admin/create-category', [CategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/admin/categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
});

// Route::get('/test-event', function () {
//    $post = Post::find('01jp1xepa4cv3en4axatkh9vdk');
//    event(new NewQuestionCreated($post));
//
//    return 'Event dispatched!';
// });

Route::get('/user/profile', [\App\Http\Controllers\UserController::class, 'show'])
    ->name('profile.show')
    ->middleware(['auth', 'verified']);

Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

Route::get('/auth/github', [SocialAuthController::class, 'redirectToGithub'])->name('auth.github');
Route::get('/auth/github/callback', [SocialAuthController::class, 'handleGithubCallback']);

// Route::get('auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])
//    ->name('auth.{provider}');
// Route::get('auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])
//    ->name('auth.{provider}.callback');
Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

Route::get('/preview-email', function () {
    return view('mail.notification');
});
Route::get('/form', [\App\Http\Controllers\Ticket\TicketController::class, 'showForm']);

Route::get('/users', [UserController::class, 'index'])->name('users.index');

Route::middleware(['auth'])->group(function () {
    Route::get('/departments/{slug}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::get('/departments/{slug}/employee', [DepartmentController::class, 'getEmployee'])->name('departments.employees');
    Route::get('/departments/{department}/available-users', [DepartmentController::class, 'getAvailableUsers'])->name('users.available');
    Route::delete('/departments/{department}/users/{user}', [DepartmentController::class, 'removeUser'])->name('departments.removeUser');
    Route::post('/departments/{department}/add-user', [DepartmentController::class, 'addUser'])->name('departments.addUser');
    Route::resource('departments', DepartmentController::class)->names('departments');
});
// Route::get('/posts/{id}/showById', [PostController::class, 'showById'])->name('posts.showById');

// Role routes

