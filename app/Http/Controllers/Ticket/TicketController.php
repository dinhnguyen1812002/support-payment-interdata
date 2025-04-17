<?php

namespace App\Http\Controllers\Ticket;

use App\Http\Controllers\Controller;
use App\Mail\TicketCreated;
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

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
}
