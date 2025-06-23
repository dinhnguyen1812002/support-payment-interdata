<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class HandlePaginationConflicts
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): ResponseAlias
    {
        try {
            $response = $next($request);

            // Check if this is a pagination request that might cause conflicts
            if ($this->isPaginationRequest($request)) {
                $this->logPaginationRequest($request);

                // Add headers to prevent caching issues
                $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->headers->set('Pragma', 'no-cache');
                $response->headers->set('Expires', '0');
            }

            return $response;

        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Pagination request failed', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'params' => $request->all(),
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // If it's an AJAX/Inertia request, return JSON error
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Pagination request failed. Please try again.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                ], 500);
            }

            throw $e;
        }
    }

    /**
     * Check if this is a pagination-related request
     */
    private function isPaginationRequest(Request $request): bool
    {
        return $request->has(['page', 'per_page']) ||
               $request->has('search') ||
               $request->has('sort') ||
               str_contains($request->path(), 'admin/');
    }

    /**
     * Log pagination request details for debugging
     */
    private function logPaginationRequest(Request $request): void
    {
        if (config('app.debug')) {
            Log::info('Pagination request processed', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'params' => $request->all(),
                'user_id' => auth()->id(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ]);
        }
    }
}
