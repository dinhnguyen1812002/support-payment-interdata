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

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  create_at: string;
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
    return format(date, 'MM/dd/yyyy');
  } catch {
    return 'Invalid date';
  }
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

  // Refs for cleanup and cancellation
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

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

  // Handle item selection with error handling
  const handleItemSelect = useCallback((url: string) => {
    try {
      // Use window.open for better UX and error handling
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback for popup blockers
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
      window.location.href = url;
    }
  }, []);

  // Memoized loading spinner component
  const LoadingSpinner = useMemo(() => (
    <div className="p-4 text-center text-muted-foreground">
      <div className="flex items-center justify-center gap-2">
        <div 
          className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" 
          role="status"
          aria-label="Loading"
        />
        Searching...
      </div>
    </div>
  ), []);

  // Memoized search results with improved rendering
  const searchResultsContent = useMemo(() => {
    if (isLoading) {
      return LoadingSpinner;
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-500" role="alert">
          {error}
        </div>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim()) {
      return (
        <CommandEmpty>
          {searchQuery.trim().length < MIN_SEARCH_LENGTH 
            ? `Type at least ${MIN_SEARCH_LENGTH} characters to search...`
            : `No results found for "${searchQuery}".`
          }
        </CommandEmpty>
      );
    }

    if (searchResults.length === 0) {
      return <CommandEmpty>Start typing to search...</CommandEmpty>;
    }

    return (
      <CommandGroup heading={`Search Results (${searchResults.length})`}>
        {searchResults.map((item) => (
          <CommandItem
            key={item.id}
            value={item.title}
            onSelect={() => handleItemSelect(item.url)}
            className="cursor-pointer hover:bg-accent focus:bg-accent"
          >
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-sm leading-tight flex-1 line-clamp-2">
                  {item.title}
                </span>
                <time 
                  className="text-xs text-muted-foreground shrink-0"
                  dateTime={item.create_at}
                >
                  {formatDate(item.create_at)}
                </time>
              </div>
              {item.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {stripHtml(item.excerpt)}
                </p>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  }, [
    isLoading,
    error,
    searchResults,
    searchQuery,
    handleItemSelect,
    LoadingSpinner,
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
        setError(null);
        setIsLoading(false);
      }
    },
    [setOpen, debouncedSearch],
  );

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">Global Search</DialogTitle>
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search for content..."
          value={searchQuery}
          onValueChange={handleSearchChange}
          className="border-none focus-visible:ring-0"
          autoFocus
        />
        <CommandList className="max-h-[400px] overflow-y-auto">
          {searchResultsContent}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export default SearchCommandDialog;