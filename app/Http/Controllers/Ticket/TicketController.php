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

        // Add search suggestions
        $data['searchSuggestions'] = $this->getSearchSuggestions();

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
                'profile_photo_path' => $post->user->profile_photo_path,
                'profile_photo_url' => $post->user->profile_photo_url,
            ],
            'assignee' => $post->assignee ? [
                'id' => $post->assignee->id,
                'name' => $post->assignee->name,
                'email' => $post->assignee->email,
                'profile_photo_path' => $post->assignee->profile_photo_path,
                'profile_photo_url' => $post->assignee->profile_photo_url,
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
        $startTime = microtime(true);
        $query = $request->input('q', '');

        if (!$query) {
            return Inertia::render('Ticket/SearchPage', [
                'tickets' => [],
                'query' => '',
                'totalResults' => 0,
                'searchTime' => 0,
                'suggestions' => ['bug', 'feature request', 'urgent', 'payment', 'login'],
                'categories' => \App\Models\Category::select(['id', 'title', 'slug'])->get(),
                'tags' => \App\Models\Tag::select(['id', 'name'])->get(),
                'departments' => \App\Models\Department::select(['id', 'name'])->get(),
                'users' => \App\Models\User::select(['id', 'name'])->get(),
                'filters' => [
                    'search' => $query,
                    'status' => $request->input('status'),
                    'priority' => $request->input('priority'),
                    'sortBy' => $request->input('sortBy', 'relevance'),
                ],
                'notifications' => [],
            ]);
        }

        $data = $this->ticketService->searchTickets($request);
        $endTime = microtime(true);
        $searchTime = round(($endTime - $startTime) * 1000); // Convert to milliseconds

        // Add search-specific data
        $data['query'] = $query;
        $data['totalResults'] = $data['tickets']->total();
        $data['searchTime'] = $searchTime;
        $data['suggestions'] = ['bug', 'feature request', 'urgent', 'payment', 'login'];

        return Inertia::render('Ticket/SearchPage', $data);
    }

    /**
     * Get search suggestions from various sources
     */
    private function getSearchSuggestions(): array
    {
        // Get popular search terms from actual ticket data
        $popularTerms = \DB::table('posts')
            ->select(\DB::raw('LOWER(title) as term'))
            ->where('is_published', true)
            ->whereNotNull('title')
            ->get()
            ->pluck('term')
            ->flatMap(function ($title) {
                // Extract meaningful words from titles
                $words = preg_split('/[\s\-_]+/', $title);
                return array_filter($words, function ($word) {
                    return strlen($word) >= 3 && !in_array(strtolower($word), [
                        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'why', 'oil', 'sit', 'set'
                    ]);
                });
            })
            ->countBy()
            ->sortDesc()
            ->take(10)
            ->keys()
            ->toArray();

        // Get category names as suggestions
        $categoryTerms = \App\Models\Category::select('title')
            ->get()
            ->pluck('title')
            ->map(fn($title) => strtolower($title))
            ->toArray();

        // Get common status and priority terms
        $systemTerms = [
            'bug', 'issue', 'problem', 'error', 'urgent', 'high priority',
            'feature request', 'enhancement', 'improvement',
            'payment', 'billing', 'account', 'login', 'password',
            'support', 'help', 'question', 'how to'
        ];

        // Combine and deduplicate
        $allSuggestions = array_unique(array_merge($popularTerms, $categoryTerms, $systemTerms));

        // Return top 15 suggestions
        return array_slice($allSuggestions, 0, 15);
    }

    /**
     * API endpoint to get search suggestions
     */
    public function apiSearchSuggestions(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 10);

        if (strlen($query) < 2) {
            return response()->json([
                'suggestions' => $this->getSearchSuggestions()
            ]);
        }

        // Get suggestions based on query
        $suggestions = collect($this->getSearchSuggestions())
            ->filter(function ($suggestion) use ($query) {
                return stripos($suggestion, $query) !== false;
            })
            ->take($limit)
            ->values()
            ->toArray();

        // If no matches, get popular terms that contain the query
        if (empty($suggestions)) {
            $suggestions = \DB::table('posts')
                ->select(\DB::raw('LOWER(title) as term'))
                ->where('is_published', true)
                ->where('title', 'LIKE', "%{$query}%")
                ->limit($limit)
                ->get()
                ->pluck('term')
                ->unique()
                ->values()
                ->toArray();
        }

        return response()->json([
            'suggestions' => $suggestions,
            'query' => $query
        ]);
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
