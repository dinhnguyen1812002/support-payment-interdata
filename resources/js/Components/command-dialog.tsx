import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/Components/ui/command';
import { format } from 'date-fns';
import { DialogTitle } from '@/Components/ui/dialog';
import { debounce } from 'lodash';
import { Search, Clock, TrendingUp, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  create_at: string;
}

interface SearchSuggestion {
  text: string;
  type: 'suggestion' | 'history';
}

interface SearchCommandDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  debounceMs?: number;
  maxResults?: number;
}

// Constants
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MAX_RESULTS = 50;
const API_TIMEOUT = 10000;
const MIN_SEARCH_LENGTH = 2;

// Utility functions moved outside component to prevent recreation
const stripHtml = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return 'Invalid date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800/50">$1</mark>');
};

export function SearchCommandDialog({
  open,
  setOpen,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  maxResults = DEFAULT_MAX_RESULTS,
}: SearchCommandDialogProps) {
  // State
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Refs for cleanup and cancellation
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Load search history on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('global-search-history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await axios.get('/api/search/suggestions', {
          params: { q: searchQuery, limit: 8 },
          timeout: 5000,
        });

        if (mountedRef.current) {
          setSuggestions(response.data.suggestions || []);
        }
      } catch (error) {
        if (mountedRef.current && !axios.isCancel(error)) {
          console.warn('Failed to fetch suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Enhanced search function with cancellation and error handling
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New search initiated');
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/global-search', {
        params: { 
          query: query.trim(),
          limit: maxResults 
        },
        timeout: API_TIMEOUT,
        cancelToken: cancelTokenRef.current.token,
      });

      // Check if component is still mounted before setting state
      if (mountedRef.current) {
        const results = response.data.results || [];
        setSearchResults(results);
      }
    } catch (error) {
      if (mountedRef.current && !axios.isCancel(error)) {
        console.error('Search failed:', error);
        const errorMessage = axios.isAxiosError(error) && error.response?.status === 429
          ? 'Too many requests. Please try again later.'
          : 'Search failed. Please try again.';
        
        setError(errorMessage);
        setSearchResults([]);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [maxResults]);

  // Optimized debounced search with stable reference
  const debouncedSearch = useMemo(
    () => debounce(performSearch, debounceMs),
    [performSearch, debounceMs]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setSelectedIndex(-1);
      
      if (value.trim().length === 0) {
        // Immediately clear results for empty query
        setSearchResults([]);
        setError(null);
        debouncedSearch.cancel();
      } else {
        debouncedSearch(value);
      }
    },
    [debouncedSearch],
  );

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    try {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('global-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory]);

  // Handle item selection with error handling
  const handleItemSelect = useCallback((url: string) => {
    try {
      // Save current search to history
      if (searchQuery.trim()) {
        saveToHistory(searchQuery.trim());
      }

      // Use window.open for better UX and error handling
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback for popup blockers
        window.location.href = url;
      }

      // Close dialog
      setOpen(false);
    } catch (error) {
      console.error('Failed to navigate:', error);
      window.location.href = url;
    }
  }, [searchQuery, saveToHistory, setOpen]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    saveToHistory(suggestion);
    // Trigger search with the suggestion
    debouncedSearch(suggestion);
  }, [saveToHistory, debouncedSearch]);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('global-search-history');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  // Enhanced loading spinner with better animation
  const LoadingSpinner = useMemo(() => (
    <div className="flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Searching...</p>
      </div>
    </div>
  ), []);

  // Enhanced error display
  const ErrorDisplay = useMemo(() => (
    <div className="flex items-center justify-center p-6" role="alert">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button 
            onClick={() => performSearch(searchQuery)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  ), [error, performSearch, searchQuery]);

  // Memoized search results with improved rendering
  const searchResultsContent = useMemo(() => {
    if (isLoading) {
      return LoadingSpinner;
    }

    if (error) {
      return ErrorDisplay;
    }

    // Show suggestions and history when no search query or query is too short
    if (!searchQuery.trim() || searchQuery.trim().length < MIN_SEARCH_LENGTH) {
      return (
        <div className="space-y-1">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <CommandGroup>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <CommandItem
                  key={`history-${index}`}
                  value={historyItem}
                  onSelect={() => handleSuggestionSelect(historyItem)}
                  className="cursor-pointer hover:bg-accent focus:bg-accent px-3 py-2 rounded-md mx-1"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{historyItem}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Popular Suggestions */}
          <CommandGroup>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Popular</span>
            </div>
            {['bug', 'feature request', 'urgent', 'payment', 'login'].map((suggestion) => (
              <CommandItem
                key={suggestion}
                value={suggestion}
                onSelect={() => handleSuggestionSelect(suggestion)}
                className="cursor-pointer hover:bg-accent focus:bg-accent px-3 py-2 rounded-md mx-1"
              >
                <div className="flex items-center gap-3 w-full">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          {searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_SEARCH_LENGTH && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Type at least {MIN_SEARCH_LENGTH} characters to search...
              </p>
            </div>
          )}
        </div>
      );
    }

    // Show suggestions while typing
    if (searchQuery.trim().length >= MIN_SEARCH_LENGTH && suggestions.length > 0 && searchResults.length === 0) {
      return (
        <div className="space-y-1">
          {isLoadingSuggestions && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading suggestions...</span>
              </div>
            </div>
          )}

          {!isLoadingSuggestions && (
            <CommandGroup>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggestions</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={`suggestion-${index}`}
                  value={suggestion}
                  onSelect={() => handleSuggestionSelect(suggestion)}
                  className="cursor-pointer hover:bg-accent focus:bg-accent px-3 py-2 rounded-md mx-1"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(suggestion, searchQuery) 
                      }}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </div>
      );
    }

    // Show search results
    if (searchResults.length === 0 && searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No results found</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search terms or check the spelling
          </p>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Start typing to search...</p>
        </div>
      );
    }

    return (
      <CommandGroup>
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Results ({searchResults.length})
            </span>
          </div>
        </div>
        <div className="space-y-1">
          {searchResults.map((item, index) => (
            <CommandItem
              key={item.id}
              value={item.title}
              onSelect={() => handleItemSelect(item.url)}
              className="cursor-pointer hover:bg-accent focus:bg-accent px-3 py-3 rounded-md mx-1 group"
            >
              <div className="flex flex-col w-full gap-2">
                <div className="flex justify-between items-start gap-3">
                  <h3 
                    className="font-medium text-sm leading-tight flex-1 line-clamp-2 group-hover:text-primary transition-colors"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(item.title, searchQuery) 
                    }}
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={item.create_at}
                    >
                      {formatDate(item.create_at)}
                    </time>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                {item.excerpt && (
                  <p 
                    className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(stripHtml(item.excerpt), searchQuery) 
                    }}
                  />
                )}
              </div>
            </CommandItem>
          ))}
        </div>
      </CommandGroup>
    );
  }, [
    isLoading,
    error,
    searchResults,
    searchQuery,
    suggestions,
    isLoadingSuggestions,
    searchHistory,
    handleItemSelect,
    handleSuggestionSelect,
    clearHistory,
    LoadingSpinner,
    ErrorDisplay,
  ]);

  // Enhanced dialog state management
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      
      if (!newOpen) {
        // Cancel any pending requests
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel('Dialog closed');
        }
        
        // Cancel debounced search
        debouncedSearch.cancel();
        
        // Reset state
        setSearchQuery('');
        setSearchResults([]);
        setSuggestions([]);
        setError(null);
        setIsLoading(false);
        setIsLoadingSuggestions(false);
        setSelectedIndex(-1);
      }
    },
    [setOpen, debouncedSearch],
  );

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">Global Search</DialogTitle>
      <Command shouldFilter={false} className="rounded-xl border shadow-lg">
        <div className="flex items-center border-b px-3">
          {/* <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" /> */}
          <CommandInput
            placeholder="Search for content..."
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground"
            autoFocus
          />
          {/* {(isLoading || isLoadingSuggestions) && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )} */}
        </div>
        <CommandList className="max-h-[480px] overflow-y-auto p-2">
          {searchResultsContent}
        </CommandList>
        
        {/* Footer with keyboard shortcuts hint */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, ↵ to select, esc to close</span>
            {searchResults.length > 0 && (
              <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}

export default SearchCommandDialog;