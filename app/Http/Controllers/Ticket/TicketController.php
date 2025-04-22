<?php

namespace App\Http\Controllers\Ticket;

use App\Http\Controllers\Controller;
use App\Mail\TicketCreated;
use App\Models\Departments;
use App\Models\Post;
use App\Models\User;
use App\Notifications\PostCreatedNotification;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;

class TicketController extends Controller
{
    use HandlesAuthorization;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'department_id' => 'required|exists:departments,id',
            'user_id' => 'required|exists:users,id',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['title']);

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

    public function show(Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        return Inertia::render('Departments/Show', [
            'department' => $department,
        ]);
    }

    public function edit(Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        return Inertia::render('Departments/Edit', [
            'department' => $department,
        ]);
    }

    public function update(Request $request, Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,'.$department->id,
            'description' => 'nullable|string',
        ]);

        $department->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(Departments $department)
    {
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        $department->delete();

        return redirect()->route('departments.index')->with('success', 'Department deleted successfully.');
    }
}
