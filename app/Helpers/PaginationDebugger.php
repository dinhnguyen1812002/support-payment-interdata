<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaginationDebugger
{
    /**
     * Debug pagination request and log potential issues
     */
    public static function debugRequest(Request $request, string $context = ''): array
    {
        $debugInfo = [
            'context' => $context,
            'timestamp' => now()->toISOString(),
            'request_id' => uniqid('debug_', true),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'headers' => [
                'user_agent' => $request->userAgent(),
                'accept' => $request->header('Accept'),
                'content_type' => $request->header('Content-Type'),
                'x_inertia' => $request->header('X-Inertia'),
                'x_inertia_version' => $request->header('X-Inertia-Version'),
                'x_requested_with' => $request->header('X-Requested-With'),
            ],
            'params' => $request->all(),
            'query_string' => $request->getQueryString(),
            'user' => [
                'id' => auth()->id(),
                'authenticated' => auth()->check(),
                'roles' => auth()->check() ? auth()->user()->getRoleNames()->toArray() : [],
            ],
            'session' => [
                'id' => session()->getId(),
                'csrf_token' => csrf_token(),
            ],
            'server' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'debug' => config('app.debug'),
            ]
        ];

        if (config('app.debug')) {
            Log::info('Pagination Debug Info', $debugInfo);
        }

        return $debugInfo;
    }

    /**
     * Check for common pagination issues
     */
    public static function checkForIssues(Request $request): array
    {
        $issues = [];

        // Check for invalid page numbers
        if ($request->has('page')) {
            $page = $request->get('page');
            if (!is_numeric($page) || $page < 1) {
                $issues[] = 'Invalid page number: ' . $page;
            }
        }

        // Check for invalid per_page values
        if ($request->has('per_page')) {
            $perPage = $request->get('per_page');
            if (!is_numeric($perPage) || $perPage < 1 || $perPage > 100) {
                $issues[] = 'Invalid per_page value: ' . $perPage;
            }
        }

        // Check for conflicting sort parameters
        if ($request->has('sort') && !$request->has('direction')) {
            $issues[] = 'Sort parameter provided without direction';
        }

        // Check for date range issues
        if ($request->has(['date_from', 'date_to'])) {
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            
            if (strtotime($dateFrom) > strtotime($dateTo)) {
                $issues[] = 'date_from is after date_to';
            }
        }

        // Check for authentication issues
        if (!auth()->check()) {
            $issues[] = 'User not authenticated';
        }

        // Check for CSRF token issues
        if (!$request->hasValidSignature() && $request->method() !== 'GET') {
            $issues[] = 'Potential CSRF token issue';
        }

        return $issues;
    }

    /**
     * Generate suggestions for fixing pagination issues
     */
    public static function generateSuggestions(array $issues): array
    {
        $suggestions = [];

        foreach ($issues as $issue) {
            switch (true) {
                case str_contains($issue, 'Invalid page number'):
                    $suggestions[] = 'Reset page to 1 or use a valid positive integer';
                    break;
                    
                case str_contains($issue, 'Invalid per_page'):
                    $suggestions[] = 'Use per_page value between 1 and 100';
                    break;
                    
                case str_contains($issue, 'Sort parameter'):
                    $suggestions[] = 'Add direction parameter (asc/desc) when using sort';
                    break;
                    
                case str_contains($issue, 'date_from is after date_to'):
                    $suggestions[] = 'Ensure date_from is before or equal to date_to';
                    break;
                    
                case str_contains($issue, 'not authenticated'):
                    $suggestions[] = 'User needs to login again';
                    break;
                    
                case str_contains($issue, 'CSRF token'):
                    $suggestions[] = 'Refresh page to get new CSRF token';
                    break;
                    
                default:
                    $suggestions[] = 'Check request parameters and try again';
            }
        }

        return array_unique($suggestions);
    }

    /**
     * Log pagination performance metrics
     */
    public static function logPerformance(string $operation, float $startTime, array $additionalData = []): void
    {
        $executionTime = microtime(true) - $startTime;
        
        $performanceData = array_merge([
            'operation' => $operation,
            'execution_time_ms' => round($executionTime * 1000, 2),
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'peak_memory_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'timestamp' => now()->toISOString(),
        ], $additionalData);

        if ($executionTime > 1.0) { // Log slow operations
            Log::warning('Slow pagination operation', $performanceData);
        } elseif (config('app.debug')) {
            Log::info('Pagination performance', $performanceData);
        }
    }
}
