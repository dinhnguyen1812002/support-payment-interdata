<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\TicketAssignmentService;
use App\Services\TicketBulkOperationsService;
use App\Services\TicketDeletionService;
use App\Services\TicketResponseService;
use App\Services\TicketStatusService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TicketBulkController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TicketAssignmentService $assignmentService,
        private TicketStatusService $statusService,
        private TicketResponseService $responseService,
        private TicketDeletionService $deletionService,
        private TicketBulkOperationsService $bulkOperationsService
    ) {}

    /**
     * Assign a single ticket to a user
     */
    public function assign(Request $request)
    {
        // $this->authorize('manage tickets');

        $validated = $request->validate([
            'ticket_id' => 'required|exists:posts,id',
            'assignee_id' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        $result = $this->assignmentService->assignTicket($validated);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Bulk assign tickets to users
     */
    public function bulkAssign(Request $request)
    {
        // $this->authorize('manage tickets');

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'assignee_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        $result = $this->assignmentService->bulkAssign($validated);

        // return response()->json($result, $result['success'] ? 200 : 500);
        return redirect()->back()->with('success', 'Tickets assigned successfully');
    }

    /**
     * Bulk update ticket status
     */
    public function bulkStatus(Request $request)
    {
        $this->authorize('manage tickets');

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'status' => ['required', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        $result = $this->statusService->bulkUpdateStatus($validated);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Bulk update ticket priority
     */
    public function bulkPriority(Request $request)
    {
    
        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        $result = $this->bulkOperationsService->bulkUpdatePriority($validated);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Bulk transfer tickets to different department
     */
    public function bulkDepartment(Request $request)
    {

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'department_id' => 'required|exists:departments,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $department = Departments::findOrFail($validated['department_id']);
            $updated = Post::whereIn('id', $validated['ticket_ids'])
                ->update([
                    'department_id' => $validated['department_id'],
                    'assignee_id' => null,
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk department transfer completed', [
                'ticket_count' => $updated,
                'new_department_id' => $department->id,
                'department_name' => $department->name,
                'transferred_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'message' => "{$updated} tickets transferred to {$department->name} successfully",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk department transfer failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $validated['ticket_ids'],
                'department_id' => $validated['department_id'],
            ]);

            return response()->json([
                'message' => 'Failed to transfer tickets',
            ], 500);
        }
    }

    /**
     * Bulk close resolved tickets
     */
    public function bulkCloseResolved(Request $request)
    {

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $validated['ticket_ids'])
                ->where('status', 'resolved')
                ->update([
                    'status' => 'closed',
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk close resolved tickets completed', [
                'ticket_count' => $updated,
                'closed_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'message' => "{$updated} resolved tickets closed successfully",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk close resolved tickets failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $validated['ticket_ids'],
            ]);

            return response()->json([
                'message' => 'Failed to close resolved tickets',
            ], 500);
        }
    }

    /**
     * Bulk add tags to tickets
     */
    public function bulkAddTags(Request $request)
    {

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'tags' => 'required|array|min:1',
            'tags.*' => 'string|max:50',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }

            $tickets = Post::whereIn('id', $validated['ticket_ids'])->get();
            foreach ($tickets as $ticket) {
                $ticket->tags()->syncWithoutDetaching($tagIds);
            }

            DB::commit();

            Log::info('Bulk add tags completed', [
                'ticket_count' => count($tickets),
                'tags' => $validated['tags'],
                'added_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'message' => 'Tags added to '.count($tickets).' tickets successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk add tags failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $validated['ticket_ids'],
                'tags' => $validated['tags'],
            ]);

            return response()->json([
                'message' => 'Failed to add tags to tickets',
            ], 500);
        }
    }

    /**
     * Bulk duplicate tickets
     */
    public function bulkDuplicate(Request $request)
    {

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $originalTickets = Post::whereIn('id', $validated['ticket_ids'])
                ->with(['categories', 'tags'])
                ->get();

            $duplicatedCount = 0;
            foreach ($originalTickets as $ticket) {
                $duplicate = $ticket->replicate();
                $duplicate->title = '[DUPLICATE] '.$ticket->title;
                $duplicate->status = 'open';
                $duplicate->assignee_id = null;
                $duplicate->created_at = now();
                $duplicate->updated_at = now();
                $duplicate->save();

                // Copy relationships
                $duplicate->categories()->sync($ticket->categories->pluck('id'));
                $duplicate->tags()->sync($ticket->tags->pluck('id'));

                $duplicatedCount++;
            }

            DB::commit();

            Log::info('Bulk duplicate tickets completed', [
                'original_count' => count($originalTickets),
                'duplicated_count' => $duplicatedCount,
                'duplicated_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'message' => "{$duplicatedCount} tickets duplicated successfully",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk duplicate tickets failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $validated['ticket_ids'],
            ]);

            return response()->json([
                'message' => 'Failed to duplicate tickets',
            ], 500);
        }
    }

    /**
     * Bulk archive tickets
     */
    public function bulkArchive(Request $request)
    {

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'reason' => 'nullable|string|max:500',
            'send_notification' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $updated = Post::whereIn('id', $validated['ticket_ids'])
                ->update([
                    'status' => 'archived',
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Bulk archive tickets completed', [
                'ticket_count' => $updated,
                'archived_by' => auth()->id(),
                'reason' => $validated['reason'] ?? null,
            ]);

            return response()->json([
                'message' => "{$updated} tickets archived successfully",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk archive tickets failed', [
                'error' => $e->getMessage(),
                'ticket_ids' => $validated['ticket_ids'],
            ]);

            return response()->json([
                'message' => 'Failed to archive tickets',
            ], 500);
        }
    }

    /**
     * Bulk delete tickets (soft delete)
     */
    public function bulkDelete(Request $request)
    {
        $this->authorize('manage tickets');

        $validated = $request->validate([
            'ticket_ids' => 'required|array|min:1',
            'ticket_ids.*' => 'exists:posts,id',
            'reason' => 'required|string|max:500',
            'send_notification' => 'boolean',
        ]);

        $result = $this->deletionService->bulkDelete($validated['ticket_ids']);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Show ticket detail page
     */
    public function show($ticket)
    {
        $this->authorize('view admin dashboard');

        $post = Post::where('slug', $ticket)
            ->orWhere('id', $ticket)
            ->with([
                'user:id,name,profile_photo_path,email', 
                'categories',
                'tags',
                'assignee',
                'department',
            ])
            ->withCount('upvotes')
            ->firstOrFail();
        // boardcast(new NewPostCreated($post))->toOthers();            
        $comments = $post->getFormattedComments();

        $ticketData = [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'content' => $post->content,
            'status' => $post->status,
            'priority' => $post->priority,
            'created_at' => $post->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $post->updated_at->format('Y-m-d H:i:s'),
            'user' => $post->user,
            'profile' => $post->user->profile_photo_path
                ? asset('storage/'.$post->user->profile_photo_path)
                : 'https://ui-avatars.com/api/?name='.urlencode($post->user->name).'&color=7F9CF5&background=EBF4FF',
            'assignee' => $post->assignee,
            'department' => $post->department,
            'categories' => $post->categories,
            'tags' => $post->tags,
            'comments' => $comments,
            'upvote_count' => $post->upvotes_count,
        ];

        return inertia('Admin/TicketDetail', [
            'ticket' => $ticketData,
        ]);
    }

    /**
     * Get ticket details with comments
     */
    public function getComments($ticket)
    {
        $this->authorize('view admin dashboard');

        $post = Post::where('slug', $ticket)
            ->orWhere('id', $ticket)
            ->with(['user', 'categories', 'tags', 'assignee', 'department'])
            ->withCount('upvotes')
            ->firstOrFail();

        $comments = $post->getFormattedComments();
        $hasUpvote = auth()->check() ? $post->isUpvotedBy(auth()->id()) : false;

        return response()->json([
            'ticket' => [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => $post->title,
                'content' => $post->content,
                'status' => $post->status,
                'priority' => $post->priority,
                'created_at' => $post->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $post->updated_at->format('Y-m-d H:i:s'),
                'user' => $post->user,
                'assignee' => $post->assignee,
                'department' => $post->department,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'comments' => $comments,
                'upvote_count' => $post->upvotes_count,
                'has_upvote' => $hasUpvote,
            ],
        ]);
    }

    /**
     * Add response/comment to a ticket
     */
    public function addResponse(Request $request, $ticket)
    {
        $this->authorize('view admin dashboard');

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'is_hr_response' => 'boolean',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Find the ticket
        $post = Post::where('slug', $ticket)
            ->orWhere('id', $ticket)
            ->firstOrFail();

        $result = $this->responseService->addResponse($post, $validated);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['error' => $result['message']]);
    }

    /**
     * Update single ticket status
     */
    public function updateStatus(Request $request, $ticket)
    {
        // $this->authorize('manage tickets');

        $validated = $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed',
        ]);

        try {
            DB::beginTransaction();

            // Find the ticket
            $post = Post::where('slug', $ticket)
                ->orWhere('id', $ticket)
                ->firstOrFail();

            $oldStatus = $post->status;
            $post->status = $validated['status'];
            $post->save();

            // Log the status change
            Log::info('Ticket status updated', [
                'ticket_id' => $post->id,
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Status updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update ticket status', [
                'ticket' => $ticket,
                'status' => $validated['status'] ?? null,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update status. Please try again.',
            ], 500);
        }
    }
}
