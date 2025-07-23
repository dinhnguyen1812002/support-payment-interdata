<?php

namespace App\Http\Controllers\Ticket;

use App\Http\Controllers\Controller;
use App\Mail\TicketCreated;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostCreatedNotification;
use App\Services\TicketService;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketController extends Controller
{
    use HandlesAuthorization;

    protected TicketService $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Display a listing of tickets
     */
    public function index(Request $request): \Inertia\Response
    {
        $data = $this->ticketService->getTicketsForIndex($request);
        return Inertia::render('Ticket/Index', $data);
    }

    /**
     * Get tickets data for AJAX requests
     */
    public function getTicketsData(Request $request): \Illuminate\Http\JsonResponse
    {
        $data = $this->ticketService->getTicketsForIndex($request);
        return response()->json(['props' => $data]);
    }

    /**
     * Display ticket manager with SPA-like navigation
     */
    // public function manager(Request $request): \Inertia\Response
    // {
    //     // Get all tickets data
    //     $allTicketsData = $this->ticketService->getTicketsForIndex($request);

    //     // Get my tickets count
    //     $myTicketsCount = auth()->check() ?
    //         \App\Models\Post::where('user_id', auth()->id())->count() : 0;

    //     $data = array_merge($allTicketsData, [
    //         'allTicketsCount' => $allTicketsData['ticketCount'],
    //         'myTicketsCount' => $myTicketsCount,
    //         'initialTickets' => $allTicketsData['tickets'],
    //         'initialPagination' => $allTicketsData['pagination'],
    //         'initialFilters' => $allTicketsData['filters'],
    //     ]);

    //     return Inertia::render('Ticket/TicketSPA', $data);
    // }
    
    /**
     * Show the form for creating a new ticket
     */
    public function create(): \Inertia\Response
    {
        $data = $this->ticketService->getCreateTicketData();
        return Inertia::render('Ticket/Create', $data);
    }

    /**
     * Display the specified ticket
     */
    public function show(string $slug): \Inertia\Response
    {
        $post = Post::where('slug', $slug)
            ->with([
                'user:id,name,profile_photo_path,email',
                'categories:id,title,slug',
                'tags:id,name',
                'assignee:id,name,profile_photo_path,email',
                'department:id,name',
            ])
            ->withCount('upvotes')
            ->firstOrFail();

        // Get formatted comments in the expected format for CommentsSection
        $formattedComments = $post->getFormattedComments();
        $comments = [
            'data' => $formattedComments,
            'next_page_url' => null
        ];

        // Check if current user has upvoted this ticket
        $hasUpvote = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        $ticketData = [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'is_published' => $post->is_published,
            'content' => $post->content,
            'status' => $post->status,
            'priority' => $post->priority,
            'created_at' => $post->created_at->diffForHumans(),
            'updated_at' => $post->updated_at->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'email' => $post->user->email,
                'profile_photo_path' => $post->user->profile_photo_path
                    ? asset('storage/'.$post->user->profile_photo_path)
                    : null,
            ],
            'assignee' => $post->assignee ? [
                'id' => $post->assignee->id,
                'name' => $post->assignee->name,
                'email' => $post->assignee->email,
                'profile_photo_path' => $post->assignee->profile_photo_path
                    ? asset('storage/'.$post->assignee->profile_photo_path)
                    : null,
            ] : null,
            'department' => $post->department,
            'categories' => $post->categories,
            'tags' => $post->tags,
            'comments' => $comments,
            'upvote_count' => $post->upvotes_count,
            'has_upvote' => $hasUpvote,
        ];

        $data = $this->ticketService->getCreateTicketData();
        $data['ticket'] = $ticketData;

        return Inertia::render('Ticket/TicketDetail', $data);
    }

    /**
     * Search tickets
     */
    public function search(Request $request): \Inertia\Response
    {
        $data = $this->ticketService->searchTickets($request);
        return Inertia::render('Ticket/Index', $data);
    }

    public function showForm()
    {
        return Inertia::render('Ticket/Form');
    }

    public function submitTicket(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            $user = $this->createGuestUser($validated['email']);
        }

        Auth::login($user);

        $ticket = Post::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => 'open',
        ]);
        $this->notifyAdmin($ticket);

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket_id' => $ticket->id,
        ]);

    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->all();

        $ticket = Post::create([
            'user_id' => $payload['user_id'] ?? null,
            'title' => $payload['title'],
            'content' => $payload['content'],
            'is_published' => false,
        ]);

        $this->notifyAdmin($ticket);

        return response()->json(['status' => 'success']);
    }

    private function createGuestUser($email)
    {
        return User::create([
            'email' => $email,
            'password' => Hash::make(uniqid()),
            'name' => 'Guest_'.substr(md5($email), 0, 8),
            'is_guest' => true,
        ]);
    }

    private function notifyAdmin($ticket)
    {
        $admins = User::hasRole('admin');
        foreach ($admins as $admin) {
            Mail::to($admin->email)->queue(new TicketCreated($ticket));
        }
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'department_id' => 'required|exists:departments,id',
            'assignee_id' => 'nullable|exists:users,id',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;

        // Ensure unique slug
        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'priority' => $validated['priority'],
            'department_id' => $validated['department_id'],
            'user_id' => auth()->id(),
            'assignee_id' => $validated['assignee_id'] ?? null,
            'slug' => $slug,
            'status' => 'open',
            'is_published' => true,
        ]);

        // Attach categories and tags
        if (!empty($validated['categories'])) {
            $post->categories()->attach($validated['categories']);
        }

        if (!empty($validated['tags'])) {
            $post->tags()->attach($validated['tags']);
        }

        // Gửi thông báo đến phòng ban
        if ($post->department) {
            $post->department->users()->each(function ($user) use ($post) {
                $user->notify(new PostCreatedNotification($post));
            });
        }

        return redirect()->route('tickets.show', $post->slug)
            ->with('success', 'Ticket created successfully!');
    }

    /**
     * Store ticket from API (existing method for backward compatibility)
     */
    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $slug = Str::slug($validated['title']);

        if (Post::existsByTitleOrSlug($validated['title'], $slug)) {
            return response()->json(['error' => 'Title or slug already exists'], 422);
        }

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'priority' => $validated['priority'],
            'department_id' => $validated['department_id'],
            'user_id' => $validated['user_id'],
            'assignee_id' => $validated['assignee_id'],
            'slug' => $slug,
            'status' => 'open',
            'is_published' => true,
        ]);

        // Gửi thông báo đến phòng ban
        $post->department->users()->each(function ($user) use ($post) {
            $user->notify(new PostCreatedNotification($post));
        });

        return response()->json([
            'message' => 'Ticket created successfully',
            'post' => $post->toFormattedArray(),
        ], 201);
    }
}
