<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutomationRule;
use App\Models\Category;
use App\Models\Departments;
use App\Models\Tag;
use App\Models\User;
use App\Services\TicketAutomationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AutomationRuleController extends Controller
{
    protected TicketAutomationService $automationService;

    public function __construct(TicketAutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

    /**
     * Display a listing of automation rules
     */
    public function index(Request $request)
    {
        Gate::authorize('view admin dashboard');

        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $rules = AutomationRule::query()
            ->with(['assignedDepartment:id,name', 'assignedUser:id,name'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('execution_order')
            ->paginate($perPage);

        $stats = $this->automationService->getAutomationStats();

        return Inertia::render('Admin/AutomationRules', [
            'rules' => $rules,
            'stats' => $stats,
            'search' => $search,
        ]);
    }

    /**
     * Show the form for creating a new automation rule
     */
    public function create()
    {
        Gate::authorize('view admin dashboard');

        return Inertia::render('Admin/AutomationRules/Create', [
            'categories' => Category::select('id', 'title')->get(),
            'tags' => Tag::select('id', 'name')->get(),
            'departments' => Departments::select('id', 'name')->get(),
            'users' => User::role(['admin', 'employee'])->select('id', 'name')->get(),
            'categoryTypes' => AutomationRule::CATEGORY_TYPES,
            'priorityLevels' => AutomationRule::PRIORITY_LEVELS,
        ]);
    }

    /**
     * Store a newly created automation rule
     */
    public function store(Request $request)
    {
        Gate::authorize('view admin dashboard');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'conditions' => 'required|array',
            'conditions.title_keywords' => 'nullable|array',
            'conditions.content_keywords' => 'nullable|array',
            'conditions.category_ids' => 'nullable|array',
            'conditions.tag_ids' => 'nullable|array',
            'actions' => 'nullable|array',
            'category_type' => 'required|in:technical,payment,consultation,general',
            'assigned_priority' => 'required|in:low,medium,high,urgent',
            'assigned_department_id' => 'nullable|exists:departments,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'execution_order' => 'integer|min:1|max:1000',
        ]);

        $validated['execution_order'] = $validated['execution_order'] ?? 100;

        AutomationRule::create($validated);

        return redirect()->route('admin.automation-rules.index')
            ->with('success', 'Automation rule created successfully.');
    }

    /**
     * Display the specified automation rule
     */
    public function show(AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        $automationRule->load(['assignedDepartment', 'assignedUser', 'autoAssignedPosts' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('Admin/AutomationRules/Show', [
            'rule' => $automationRule,
        ]);
    }

    /**
     * Show the form for editing the specified automation rule
     */
    public function edit(AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        return Inertia::render('Admin/AutomationRules/Edit', [
            'rule' => $automationRule,
            'categories' => Category::select('id', 'title')->get(),
            'tags' => Tag::select('id', 'name')->get(),
            'departments' => Departments::select('id', 'name')->get(),
            'users' => User::role(['admin', 'employee'])->select('id', 'name')->get(),
            'categoryTypes' => AutomationRule::CATEGORY_TYPES,
            'priorityLevels' => AutomationRule::PRIORITY_LEVELS,
        ]);
    }

    /**
     * Update the specified automation rule
     */
    public function update(Request $request, AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'conditions' => 'required|array',
            'conditions.title_keywords' => 'nullable|array',
            'conditions.content_keywords' => 'nullable|array',
            'conditions.category_ids' => 'nullable|array',
            'conditions.tag_ids' => 'nullable|array',
            'actions' => 'nullable|array',
            'category_type' => 'required|in:technical,payment,consultation,general',
            'assigned_priority' => 'required|in:low,medium,high,urgent',
            'assigned_department_id' => 'nullable|exists:departments,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'execution_order' => 'integer|min:1|max:1000',
        ]);

        $automationRule->update($validated);

        return redirect()->route('admin.automation-rules.index')
            ->with('success', 'Automation rule updated successfully.');
    }

    /**
     * Remove the specified automation rule
     */
    public function destroy(AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        $automationRule->delete();

        return redirect()->route('admin.automation-rules.index')
            ->with('success', 'Automation rule deleted successfully.');
    }

    /**
     * Toggle the active status of an automation rule
     */
    public function toggleActive(AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        $automationRule->update([
            'is_active' => ! $automationRule->is_active,
        ]);

        $status = $automationRule->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Automation rule {$status} successfully.");
    }

    /**
     * Test an automation rule against existing posts
     */
    public function test(Request $request, AutomationRule $automationRule)
    {
        Gate::authorize('view admin dashboard');

        $validated = $request->validate([
            'test_content' => 'required|string',
            'test_title' => 'required|string',
        ]);

        // Create a temporary post object for testing
        $testPost = (object) [
            'title' => $validated['test_title'],
            'content' => $validated['test_content'],
            'categories' => collect([]),
            'tags' => collect([]),
        ];

        $matches = $automationRule->matchesPost($testPost);

        return response()->json([
            'matches' => $matches,
            'rule_name' => $automationRule->name,
            'would_apply' => $matches ? [
                'category_type' => $automationRule->category_type,
                'priority' => $automationRule->assigned_priority,
                'department' => $automationRule->assignedDepartment?->name,
                'assignee' => $automationRule->assignedUser?->name,
            ] : null,
        ]);
    }

    /**
     * Get automation statistics
     */
    public function stats()
    {
        Gate::authorize('view admin dashboard');

        $stats = $this->automationService->getAutomationStats();

        return response()->json($stats);
    }

    /**
     * Bulk update priority scores
     */
    public function bulkUpdateScores()
    {
        Gate::authorize('view admin dashboard');

        $updated = $this->automationService->bulkUpdatePriorityScores();

        return back()->with('success', "Updated priority scores for {$updated} posts.");
    }
}
