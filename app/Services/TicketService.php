<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\Departments;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TicketService
{
    /**
     * Number of tickets per page
     */
    const TICKETS_PER_PAGE = 5;

    /**
     * Get tickets for index page with filtering and pagination
     */
    public function getTicketsForIndex(Request $request): array
    {
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'latest');
        $status = $request->input('status', null);
        $priority = $request->input('priority', null);
        $department = $request->input('department', null);
        $assignee = $request->input('assignee', null);
        $category = $request->input('category', null);

        // Build query for tickets (posts with ticket-like behavior)
        $query = Post::query()
            ->with(['user', 'categories', 'tags', 'assignee', 'department'])
            ->withCount(['upvotes', 'comments']);

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if ($status) {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($department) {
            $query->where('department_id', $department);
        }

        if ($assignee) {
            $query->where('assignee_id', $assignee);
        }

        if ($category) {
            $query->whereHas('categories', function ($q) use ($category) {
                // Support both slug and ID for backward compatibility
                if (is_numeric($category)) {
                    $q->where('categories.id', $category);
                } else {
                    $q->where('categories.slug', $category);
                }
            });
        }

        // Apply sorting
        switch ($sort) {
            case 'latest':
            case 'newest':
                $query->latest();
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'priority':
                $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')");
                break;
            case 'upvotes':
            case 'most-upvoted':
                $query->orderBy('upvotes_count', 'desc');
                break;
            case 'most-replies':
                $query->orderBy('comments_count', 'desc');
                break;
            case 'inactive':
                // Sort by inactive status first (closed, resolved), then by updated_at desc
                $query->orderByRaw("FIELD(status, 'closed', 'resolved', 'in_progress', 'open')")
                      ->orderBy('updated_at', 'desc');
                break;
        }

        $tickets = $query->paginate(self::TICKETS_PER_PAGE)->withQueryString();

        $user = auth()->user();
        $notifications = $user?->unreadNotifications ?? [];

        return [
            'tickets' => $tickets->map(function ($ticket) {
                return $ticket->toFormattedArray();
            }),
            'categories' => $this->getCategories(),
            'tags' => $this->getTags(),
            'departments' => $this->getDepartments(),
            'users' => $this->getUsers(),
            'ticketCount' => $tickets->total(),
            'pagination' => $this->getPaginationData($tickets),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
            'filters' => [
                'status' => $status,
                'priority' => $priority,
                'category' => $category,
                'department' => $department,
                'assignee' => $assignee,
                'search' => $search,
                'myTickets' => false,
                'sortBy' => $sort,
            ],
        ];
    }

    /**
     * Prepare ticket detail data
     */
    public function prepareTicketData(Post $ticket): array
    {
        $categories = $this->getCategories();
        $tags = $this->getTags();
        $departments = $this->getDepartments();
        $users = $this->getUsers();

        $comments = $ticket->getFormattedComments();
        $hasUpvote = auth()->check() ? $ticket->isUpvotedBy(auth()->id()) : false;

        return [
            'ticket' => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'content' => $ticket->content,
                'created_at' => $ticket->created_at->diffForHumans(),
                'updated_at' => $ticket->updated_at,
                'is_published' => $ticket->is_published,
                'user' => $ticket->user,
                'categories' => $ticket->categories,
                'tags' => $ticket->tags,
                'comments' => $comments,
                'upvote_count' => $ticket->upvotes_count,
                'has_upvote' => $hasUpvote,
                'priority' => $ticket->priority,
                'priority_name' => $ticket->priority_name,
                'priority_score' => $ticket->priority_score,
                'status' => $ticket->status,
                'status_name' => $ticket->status_name,
                'assignee' => $ticket->assignee,
                'department' => $ticket->department,
                'is_auto_assigned' => $ticket->isAutoAssigned(),
                'automation_history' => $ticket->getAutomationHistory(),
            ],
            'categories' => $categories,
            'tags' => $tags,
            'departments' => $departments,
            'users' => $users,
        ];
    }

    /**
     * Get data for ticket create page
     */
    public function getCreateTicketData(): array
    {
        return [
            'categories' => $this->getCategories(),
            'tags' => $this->getTags(),
            'departments' => $this->getDepartments(),
            'users' => $this->getUsers(),
            'notifications' => auth()->check() ? auth()->user()->unreadNotifications : [],
        ];
    }

    /**
     * Get categories for dropdowns
     */
    private function getCategories(): Collection
    {
        return Category::select(['id', 'title', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
    }

    /**
     * Get tags for dropdowns
     */
    private function getTags(): Collection
    {
        return Tag::select(['id', 'name', 'slug'])
            ->withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->get();
    }

    /**
     * Get departments for dropdowns
     */
    private function getDepartments(): Collection
    {
        return Departments::select(['id', 'name'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get users for assignment dropdowns
     */
    private function getUsers(): Collection
    {
        return User::select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get pagination data
     */
    private function getPaginationData(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'has_more_pages' => $paginator->hasMorePages(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
        ];
    }

    /**
     * Get ticket statistics
     */
    public function getTicketStats(): array
    {
        return [
            'total' => Post::count(),
            'open' => Post::where('status', 'open')->count(),
            'in_progress' => Post::where('status', 'in_progress')->count(),
            'resolved' => Post::where('status', 'resolved')->count(),
            'closed' => Post::where('status', 'closed')->count(),
        ];
    }

    /**
     * Search tickets
     */
    public function searchTickets(Request $request): array
    {
        $search = $request->input('q', $request->input('search', ''));
        $sort = $request->input('sortBy', $request->input('sort', 'relevance'));
        $category = $request->input('category', null);
        $status = $request->input('status', null);
        $priority = $request->input('priority', null);

        // Use search functionality similar to PostService
        $ticketIds = Post::search($search)->keys();

        $tickets = Post::whereIn('id', $ticketIds)
            ->where('is_published', true)
            ->with(['user', 'categories', 'assignee', 'department'])
            ->withCount(['upvotes', 'comments'])
            ->when($category, function ($q) use ($category) {
                $q->whereHas('categories', function ($subQ) use ($category) {
                    // Support both slug and ID for backward compatibility
                    if (is_numeric($category)) {
                        $subQ->where('categories.id', $category);
                    } else {
                        $subQ->where('categories.slug', $category);
                    }
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($priority, fn ($q) => $q->where('priority', $priority))
            ->when($sort === 'latest' || $sort === 'newest', fn ($q) => $q->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")->latest())
            ->when($sort === 'oldest', fn ($q) => $q->oldest())
            ->when($sort === 'upvotes' || $sort === 'most-upvoted', fn ($q) => $q->orderBy('upvotes_count', 'desc'))
            ->when($sort === 'most-replies', fn ($q) => $q->orderBy('comments_count', 'desc'))
            ->when($sort === 'priority', fn ($q) => $q->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')"))
            ->when($sort === 'inactive', fn ($q) => $q->orderByRaw("FIELD(status, 'closed', 'resolved', 'in_progress', 'open')")->orderBy('updated_at', 'desc'))
            ->when($sort === 'relevance', function ($q) use ($search) {
                // For relevance, order by title match first, then content match
                if ($search) {
                    return $q->orderByRaw("
                        CASE
                            WHEN title LIKE ? THEN 1
                            WHEN content LIKE ? THEN 2
                            ELSE 3
                        END, created_at DESC
                    ", ["%{$search}%", "%{$search}%"]);
                }
                return $q->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")->latest();
            })
            ->paginate(self::TICKETS_PER_PAGE)
            ->withQueryString();

        $user = auth()->user();
        $notifications = $user ? $user->unreadNotifications : [];

        return [
            'tickets' => $tickets->map(fn ($ticket) => $ticket->toFormattedArray()),
            'categories' => $this->getCategories(),
            'departments' => $this->getDepartments(),
            'users' => $this->getUsers(),
            'tags' => $this->getTags(),
            'ticketCount' => $tickets->total(),
            'pagination' => $this->getPaginationData($tickets),
            'keyword' => $search,
            'notifications' => $notifications,
            'sort' => $sort,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => $status,
                'priority' => $priority,
                'sortBy' => $sort,
            ],
        ];
    }


}
