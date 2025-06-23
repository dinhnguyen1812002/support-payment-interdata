<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pagination Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for pagination functionality
    | to help prevent 409 conflicts and improve performance.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default Items Per Page
    |--------------------------------------------------------------------------
    |
    | This value determines the default number of items to display per page
    | when no per_page parameter is provided.
    |
    */
    'default_per_page' => env('PAGINATION_DEFAULT_PER_PAGE', 10),

    /*
    |--------------------------------------------------------------------------
    | Maximum Items Per Page
    |--------------------------------------------------------------------------
    |
    | This value determines the maximum number of items that can be requested
    | per page to prevent performance issues.
    |
    */
    'max_per_page' => env('PAGINATION_MAX_PER_PAGE', 100),

    /*
    |--------------------------------------------------------------------------
    | Minimum Items Per Page
    |--------------------------------------------------------------------------
    |
    | This value determines the minimum number of items per page.
    |
    */
    'min_per_page' => env('PAGINATION_MIN_PER_PAGE', 5),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for caching pagination results to improve performance
    | and reduce database load.
    |
    */
    'cache' => [
        'enabled' => env('PAGINATION_CACHE_ENABLED', true),
        'ttl' => env('PAGINATION_CACHE_TTL', 300), // 5 minutes
        'prefix' => env('PAGINATION_CACHE_PREFIX', 'pagination'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Lock Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for preventing concurrent pagination requests that might
    | cause conflicts.
    |
    */
    'lock' => [
        'enabled' => env('PAGINATION_LOCK_ENABLED', true),
        'timeout' => env('PAGINATION_LOCK_TIMEOUT', 10), // seconds
        'wait_timeout' => env('PAGINATION_LOCK_WAIT_TIMEOUT', 5), // seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for debugging pagination issues.
    |
    */
    'debug' => [
        'enabled' => env('PAGINATION_DEBUG_ENABLED', false),
        'log_slow_queries' => env('PAGINATION_LOG_SLOW_QUERIES', true),
        'slow_query_threshold' => env('PAGINATION_SLOW_QUERY_THRESHOLD', 1000), // milliseconds
        'log_performance' => env('PAGINATION_LOG_PERFORMANCE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Retry Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for retrying failed pagination requests.
    |
    */
    'retry' => [
        'enabled' => env('PAGINATION_RETRY_ENABLED', true),
        'max_attempts' => env('PAGINATION_RETRY_MAX_ATTEMPTS', 3),
        'delay' => env('PAGINATION_RETRY_DELAY', 1000), // milliseconds
        'backoff_multiplier' => env('PAGINATION_RETRY_BACKOFF_MULTIPLIER', 2),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configuration for rate limiting pagination requests to prevent abuse.
    |
    */
    'rate_limit' => [
        'enabled' => env('PAGINATION_RATE_LIMIT_ENABLED', true),
        'max_requests' => env('PAGINATION_RATE_LIMIT_MAX_REQUESTS', 60),
        'per_minutes' => env('PAGINATION_RATE_LIMIT_PER_MINUTES', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Validation Rules
    |--------------------------------------------------------------------------
    |
    | Default validation rules for pagination parameters.
    |
    */
    'validation' => [
        'page' => 'nullable|integer|min:1',
        'per_page' => 'nullable|integer|min:'.env('PAGINATION_MIN_PER_PAGE', 5).'|max:'.env('PAGINATION_MAX_PER_PAGE', 100),
        'search' => 'nullable|string|max:255',
        'sort' => 'nullable|string|max:50',
        'direction' => 'nullable|in:asc,desc',
    ],

    /*
    |--------------------------------------------------------------------------
    | Error Messages
    |--------------------------------------------------------------------------
    |
    | Custom error messages for pagination-related errors.
    |
    */
    'error_messages' => [
        'conflict' => 'A pagination conflict occurred. Please try again.',
        'timeout' => 'The request timed out. Please try again.',
        'invalid_page' => 'Invalid page number provided.',
        'invalid_per_page' => 'Invalid items per page value.',
        'rate_limit_exceeded' => 'Too many requests. Please wait before trying again.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Server Optimization
    |--------------------------------------------------------------------------
    |
    | Configuration for server-side optimizations.
    |
    */
    'optimization' => [
        'use_cursor_pagination' => env('PAGINATION_USE_CURSOR', false),
        'preload_next_page' => env('PAGINATION_PRELOAD_NEXT', false),
        'compress_response' => env('PAGINATION_COMPRESS_RESPONSE', true),
        'use_database_views' => env('PAGINATION_USE_DB_VIEWS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for frontend pagination behavior.
    |
    */
    'frontend' => [
        'show_page_numbers' => env('PAGINATION_SHOW_PAGE_NUMBERS', 5),
        'show_first_last' => env('PAGINATION_SHOW_FIRST_LAST', true),
        'show_previous_next' => env('PAGINATION_SHOW_PREV_NEXT', true),
        'loading_indicator' => env('PAGINATION_LOADING_INDICATOR', true),
    ],
];
