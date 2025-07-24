# Search Suggestions System

A comprehensive search suggestions system that provides intelligent search recommendations from backend data.

## Features

- ✅ **Backend-Generated Suggestions** - Dynamic suggestions from actual ticket data
- ✅ **API-Powered Suggestions** - Real-time suggestions via API endpoints
- ✅ **Multiple Sources** - Popular terms, categories, and system terms
- ✅ **Smart Filtering** - Context-aware suggestions based on user input
- ✅ **Caching & Performance** - Optimized for fast response times
- ✅ **Fallback Support** - Static suggestions when API fails

## Backend Implementation

### 1. TicketController - Search Suggestions

```php
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
                    // Common stop words excluded
                    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all'
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

    // Get common system terms
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
```

### 2. API Endpoint for Dynamic Suggestions

```php
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
```

### 3. Route Configuration

```php
// API endpoint for search suggestions
Route::get('/api/search/suggestions', [TicketController::class, 'apiSearchSuggestions'])
    ->name('api.search.suggestions');
```

## Frontend Implementation

### 1. SearchInput Component with API Support

```tsx
<SearchInput
  value={filters.search || ''}
  placeholder="Search tickets..."
  onSearch={(value) => updateFilters({ search: value || undefined })}
  showHistory={true}
  showSuggestions={true}
  storageKey="ticket-search-history"
  suggestions={searchSuggestions} // Static suggestions from backend
  enableApiSuggestions={true}      // Enable dynamic API suggestions
  apiSuggestionsUrl="/api/search/suggestions"
  size="md"
/>
```

### 2. Component Props

```tsx
interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  showHistory?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];           // Static suggestions
  enableApiSuggestions?: boolean;   // Enable API suggestions
  apiSuggestionsUrl?: string;       // API endpoint URL
  debounceMs?: number;
  maxHistoryItems?: number;
  storageKey?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### 3. API Integration Logic

```tsx
// Fetch API suggestions when search term changes
useEffect(() => {
  if (!enableApiSuggestions || !searchTerm || searchTerm.length < 2) {
    setApiSuggestions([]);
    return;
  }

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${apiSuggestionsUrl}?q=${encodeURIComponent(searchTerm)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setApiSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.warn('Failed to fetch search suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const timeoutId = setTimeout(fetchSuggestions, 300);
  return () => clearTimeout(timeoutId);
}, [searchTerm, enableApiSuggestions, apiSuggestionsUrl]);
```

## Data Flow

### 1. Page Load Suggestions
```
Controller → getSearchSuggestions() → Static suggestions → Frontend
```

### 2. Dynamic API Suggestions
```
User types → API call → apiSearchSuggestions() → Filtered suggestions → Frontend
```

### 3. Suggestion Sources Priority
1. **API Suggestions** - Real-time, query-specific
2. **Static Suggestions** - Pre-loaded from backend
3. **Search History** - User's previous searches
4. **Popular Searches** - Fallback suggestions

## Usage Examples

### Basic Implementation
```tsx
// In FilterSidebar
<SearchInput
  value={filters.search}
  onSearch={(value) => updateFilters({ search: value })}
  suggestions={searchSuggestions}
  enableApiSuggestions={true}
/>
```

### Advanced Configuration
```tsx
// With custom API endpoint and settings
<SearchInput
  value={searchQuery}
  placeholder="Search tickets, categories..."
  onSearch={handleSearch}
  showHistory={true}
  showSuggestions={true}
  suggestions={staticSuggestions}
  enableApiSuggestions={true}
  apiSuggestionsUrl="/api/custom/suggestions"
  debounceMs={300}
  maxHistoryItems={8}
  storageKey="custom-search-history"
/>
```

## API Response Format

```json
{
  "suggestions": [
    "payment issue",
    "login problem", 
    "feature request",
    "bug report",
    "urgent support"
  ],
  "query": "pay"
}
```

## Performance Considerations

### Backend Optimization
1. **Database Indexing** - Index title and content columns
2. **Query Caching** - Cache popular suggestions
3. **Limit Results** - Reasonable limits (10-15 suggestions)
4. **Stop Words** - Filter out common words

### Frontend Optimization
1. **Debouncing** - 300ms delay for API calls
2. **Request Cancellation** - Cancel previous requests
3. **Error Handling** - Graceful fallback to static suggestions
4. **Loading States** - Show loading indicators

## Testing

### API Testing
```bash
# Test basic suggestions
curl "/api/search/suggestions"

# Test query-specific suggestions  
curl "/api/search/suggestions?q=payment&limit=5"
```

### Frontend Testing
- Visit `/demo/search` for comprehensive testing
- Test API suggestions with different queries
- Verify fallback behavior when API fails
- Check loading states and error handling

## Configuration

### Environment Variables
```env
# Optional: Configure suggestion limits
SEARCH_SUGGESTIONS_LIMIT=15
SEARCH_API_TIMEOUT=5000
```

### Customization
```php
// In TicketController
private function getCustomSuggestions(): array
{
    // Add your custom logic here
    return [
        'custom suggestion 1',
        'custom suggestion 2'
    ];
}
```

## Related Files

- `app/Http/Controllers/Ticket/TicketController.php` - Backend suggestions logic
- `resources/js/Components/SearchInput.tsx` - Frontend component
- `resources/js/Pages/Ticket/FilterSidebar.tsx` - Implementation
- `routes/web.php` - API routes
- `resources/js/Pages/Demo/SearchDemo.tsx` - Testing page

## Migration Guide

If upgrading from static suggestions:

1. Add `searchSuggestions` to controller responses
2. Update component props to include `searchSuggestions`
3. Enable API suggestions with `enableApiSuggestions={true}`
4. Test both static and dynamic suggestions
5. Monitor API performance and adjust debounce timing

The search suggestions system now provides intelligent, context-aware recommendations that improve user search experience! 🔍✨
