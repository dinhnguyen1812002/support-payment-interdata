<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class CommentRateLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = auth()->user();
        $key = 'comment_rate_limit:' . $user->id;
        
        // Rate limit: 1 comment per 3 seconds
        $executed = RateLimiter::attempt(
            $key,
            1, // max attempts
            function () {
                // This closure will be executed if rate limit is not exceeded
                return true;
            },
            3 // decay in seconds
        );

        if (!$executed) {
            $retryAfter = RateLimiter::availableIn($key);
            
            return response()->json([
                'error' => 'Too many comments. Please wait before posting again.',
                'retry_after' => $retryAfter
            ], 429);
        }

        return $next($request);
    }
}
