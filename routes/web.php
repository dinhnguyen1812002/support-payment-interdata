<?php

use App\Events\NewQuestionCreated;
use App\Http\Controllers\Admin\AdminController;
use Inertia\Inertia;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Comment\CommentsController;
use App\Http\Controllers\Department\DepartmentController;
use App\Http\Controllers\DocsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Oauth\SocialAuthController;
use App\Http\Controllers\Permission\PermissionController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Role\RoleController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UpvoteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Ticket\TicketController;
use Illuminate\Support\Facades\Route;

// Homepage
Route::get('/', [PostController::class, 'index'])->name('/');
Route::get('/all', [PostController::class, 'getAllTicket'])->name('all');
// Route::get('/mytickets' , PostController::class, 'getMyTickets')->name('mytickets');
Route::get('/top-voted-posts', [PostController::class, 'getTopVotePosts']);
Route::get('/demo/avatar', [PostController::class, 'demoAvatar']);
Route::get('/demo/avatar-demo', [PostController::class, 'demoAvatar'])->name('demo.avatar');

Route::get('/demo/upvote', function () {
    $tickets = \App\Models\Post::with(['user'])
        ->withCount('upvotes')
        ->take(3)
        ->get()
        ->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->getExcerpt(),
                'upvote_count' => $post->upvotes_count ?? 0,
                'has_upvote' => auth()->check() ? $post->isUpvotedBy(auth()->id()) : false,
            ];
        });

    return Inertia::render('Demo/UpvoteDemo', [
        'tickets' => $tickets
    ]);
})->name('demo.upvote');

Route::get('/demo/category-filter', function () {
    $categories = \App\Models\Category::select(['id', 'title', 'slug', 'description'])
        ->withCount('posts')
        ->orderBy('posts_count', 'desc')
        ->get();

    return Inertia::render('Demo/CategoryFilterDemo', [
        'categories' => $categories
    ]);
})->name('demo.category-filter');

Route::get('/demo/search', function () {
    return Inertia::render('Demo/SearchDemo');
})->name('demo.search');

Route::get('/demo/responsive', function () {
    return Inertia::render('Demo/ResponsiveDemo');
})->name('demo.responsive');

// API endpoint for search suggestions
Route::get('/api/search/suggestions', [\App\Http\Controllers\Ticket\TicketController::class, 'apiSearchSuggestions'])
    ->name('api.search.suggestions');
Route::get('/admin/posts/trash', [PostController::class, 'getTrash'])->name('posts.trash');
// Route::get('/posts', [PostController::class, 'getPostByUser']);
Route::middleware(['auth'])->group(function () {
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/new-post', [PostController::class, 'store'])->name('posts.store');

    Route::get('/posts/{slug}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}/delete', [PostController::class, 'destroy'])->name('posts.destroy');
    Route::post('/posts/{id}/restore', [PostController::class, 'restore'])->name('posts.restore');
    Route::post('/comments', [CommentsController::class, 'store'])
        ->middleware('comment.rate.limit')
        ->name('comments.store');

    // Nếu bạn muốn thêm routes cho reply comments
    Route::post('/comments/{comment}/reply', [CommentsController::class, 'reply'])->name('comments.reply');

});
Route::get('/posts/search', [PostController::class, 'search'])->name('posts.search');
Route::get('/categories/{categorySlug}/posts', [PostController::class, 'filterPostByCategory'])
    ->name('categories.posts.index');

Route::get('/tags/{tagsSlug}/posts', [PostController::class, 'filterPostByTag'])
    ->name('tags.posts.index');

Route::get('/posts/{slug}', [PostController::class, 'show'])->name('posts.show');

Route::post('/posts/{id}/upvote', [UpvoteController::class, 'upvote'])
    ->name('posts.upvote');
Route::patch('/posts/{post}/update-status', [PostController::class, 'updateStatus'])
    ->name('posts.update-status');
Route::delete('/comments/{comment}', [CommentsController::class, 'destroy'])
    ->middleware(['auth:sanctum'])
    ->name('comments.destroy');

Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
    ->middleware('auth')
    ->name('notifications.read_all');
Route::get('/send-email', [\Illuminate\Notifications\Notification::class, 'sendEmailNotification']);

// Route::middleware(['auth:sanctum', 'verified'])->group(function () {
//     Route::get('/admin/docs/{file?}', [DocsController::class, 'show'])
//         ->where('file', '.*\.md')
//         ->name('admin.docs.show');

//     Route::get('/dashboard', function () {
//         return view('dashboard');
//     })->name('dashboard');
// });

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
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/posts', [AdminController::class, 'getAllPost'])->name('admin.posts');
    Route::get('/admin/categories', [AdminController::class, 'getAllCategory'])->name('admin.categories');
    Route::post('/admin/create-category', [CategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/admin/categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
    Route::delete('/admin/categories/{category}/remove-logo', [CategoryController::class, 'removeLogo'])->name('admin.categories.remove-logo');
    Route::get('/admin/tags', [AdminController::class, 'getAllTags'])->name('admin.tags');
    Route::get('/admin/roles-permissions', [AdminController::class, 'getAllRolesAndPermissions'])->name('admin.roles-permissions');

    // Automation Rules routes
    Route::resource('/admin/automation-rules', \App\Http\Controllers\Admin\AutomationRuleController::class)->names([
        'index' => 'admin.automation-rules.index',
        'create' => 'admin.automation-rules.create',
        'store' => 'admin.automation-rules.store',
        'show' => 'admin.automation-rules.show',
        'edit' => 'admin.automation-rules.edit',
        'update' => 'admin.automation-rules.update',
        'destroy' => 'admin.automation-rules.destroy',
    ]);

    Route::patch('/admin/automation-rules/{automationRule}/toggle', [\App\Http\Controllers\Admin\AutomationRuleController::class, 'toggleActive'])->name('admin.automation-rules.toggle');
    Route::post('/admin/automation-rules/{automationRule}/test', [\App\Http\Controllers\Admin\AutomationRuleController::class, 'test'])->name('admin.automation-rules.test');
    Route::get('/admin/automation-stats', [\App\Http\Controllers\Admin\AutomationRuleController::class, 'stats'])->name('admin.automation-rules.stats');
    Route::post('/admin/bulk-update-scores', [\App\Http\Controllers\Admin\AutomationRuleController::class, 'bulkUpdateScores'])->name('admin.bulk-update-scores');

    // Ticket bulk operations routes
    Route::post('/admin/tickets/assign', [\App\Http\Controllers\Admin\TicketBulkController::class, 'assign'])->name('admin.tickets.assign');
    Route::post('/admin/tickets/bulk-assign', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkAssign'])->name('admin.tickets.bulk-assign');
    Route::post('/admin/tickets/bulk-status', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkStatus'])->name('admin.tickets.bulk-status');
    Route::post('/admin/tickets/bulk-priority', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkPriority'])->name('admin.tickets.bulk-priority');
    Route::post('/admin/tickets/bulk-department', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkDepartment'])->name('admin.tickets.bulk-department');
    Route::post('/admin/tickets/bulk-close-resolved', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkCloseResolved'])->name('admin.tickets.bulk-close-resolved');
    Route::post('/admin/tickets/bulk-add-tags', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkAddTags'])->name('admin.tickets.bulk-add-tags');
    Route::post('/admin/tickets/bulk-duplicate', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkDuplicate'])->name('admin.tickets.bulk-duplicate');
    Route::post('/admin/tickets/bulk-archive', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkArchive'])->name('admin.tickets.bulk-archive');
    Route::post('/admin/tickets/bulk-delete', [\App\Http\Controllers\Admin\TicketBulkController::class, 'bulkDelete'])->name('admin.tickets.bulk-delete');
    Route::get('/admin/tickets/{slug}', [\App\Http\Controllers\Admin\TicketBulkController::class, 'show'])->name('admin.tickets.show');
    Route::get('/admin/tickets/{slug}/comments', [\App\Http\Controllers\Admin\TicketBulkController::class, 'getComments'])->name('admin.tickets.comments');
    Route::post('/admin/tickets/{slug}/respond', [\App\Http\Controllers\Admin\TicketBulkController::class, 'addResponse'])->name('admin.tickets.respond');
    Route::post('/admin/tickets/{slug}/status', [\App\Http\Controllers\Admin\TicketBulkController::class, 'updateStatus'])->name('admin.tickets.update-status');
    // Documentation routes
    Route::get('/admin/docs', [DocsController::class, 'adminIndex'])->name('admin.docs.index');
    Route::get('/admin/docs/{file?}', [DocsController::class, 'show'])->name('admin.docs.show');

});
// Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
// Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

// Route::get('/test-event', function () {
//    $post = Post::find('01jp1xepa4cv3en4axatkh9vdk');
//    event(new NewQuestionCreated($post));
//
//    return 'Event dispatched!';
// });

Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read_all');
Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
Route::resource('/admin/tags', TagController::class)->only(['store', 'update', 'destroy']);

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
Route::get('/form', [TicketController::class, 'showForm']);

// Ticket routes
Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
// Route::get('/tickets/spa', [\App\Http\Controllers\Ticket\TicketController::class, 'manager'])->name('tickets.spa');
Route::get('/tickets/my-tickets', [PostController::class, 'getMyTickets'])->name('tickets.my')->middleware('auth');
Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
Route::get('/tickets/search', [TicketController::class, 'search'])->name('tickets.search');
Route::get('/tickets/{slug}', [TicketController::class, 'show'])->name('tickets.show');
Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');

// AJAX API routes for ticket data
// Route::middleware(['web'])->group(function () {
//     Route::get('/api/tickets/data', [\App\Http\Controllers\Ticket\TicketController::class, 'getTicketsData'])->name('tickets.data');
//     Route::get('/api/tickets/my/data', [\App\Http\Controllers\PostController::class, 'getMyTicketsData'])->name('tickets.my.data')->middleware('auth');
// });

Route::get('/admin/users', [UserController::class, '/admin/tickets/bulk-assign'])->name('users.index');

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

// API endpoints cho role và permission - Grouped under middleware
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/users/assign-role-api', [PermissionController::class, 'assignRole'])->name('users.assign-role-api');
    Route::post('/users/assign-permissions-api', [PermissionController::class, 'assignPermissions'])->name('users.assign-permissions-api');
    Route::post('/admin/roles', [RoleController::class, 'storeRole'])->name('admin.roles.store');
    Route::put('/admin/roles/{id}', [RoleController::class, 'updateRole'])->name('admin.roles.update');

    // API endpoints for permissions
    Route::post('/admin/permissions', [PermissionController::class, 'store'])->name('admin.permissions.store');
    Route::put('/admin/permissions/{id}', [PermissionController::class, 'update'])->name('admin.permissions.update');
    Route::delete('/admin/permissions/{id}', [PermissionController::class, 'destroy'])->name('admin.permissions.destroy');
});

// Admin routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/notifications', [AdminController::class, 'notifications'])->name('notifications');

    Route::get('/posts/{id}', [AdminController::class, 'getPost'])->name('posts.get');
    Route::get('/assignment-data', [AdminController::class, 'getAssignmentData'])->name('assignment-data');
});
