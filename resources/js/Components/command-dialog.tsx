import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

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
// import { debounce } from '@/Utils/utils';

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
}

export function SearchCommandDialog({
  open,
  setOpen,
  debounceMs = 300,
}: SearchCommandDialogProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/global-search', {
          params: { query: query.trim() },
          timeout: 10000, // 10 second timeout
        });
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
        setError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs],
  );

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Handle item selection
  const handleItemSelect = useCallback((url: string) => {
    window.location.href = url;
  }, []);

  // Memoized stripped HTML function
  const stripHtml = useCallback((html: string): string => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }, []);

  // Memoized date formatter
  const formatDate = useCallback((dateString: string): string => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch {
      return 'Invalid date';
    }
  }, []);

  // Memoized search results rendering
  const searchResultsContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Searching...
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    if (searchResults.length === 0 && searchQuery.trim()) {
      return <CommandEmpty>No results found for "{searchQuery}".</CommandEmpty>;
    }

    if (searchResults.length === 0) {
      return <CommandEmpty>Start typing to search...</CommandEmpty>;
    }

    return (
      <CommandGroup heading={`Search Results (${searchResults.length})`}>
        {searchResults.map(item => (
          <CommandItem
            key={item.id}
            value={item.title}
            onSelect={() => handleItemSelect(item.url)}
            className="cursor-pointer"
          >
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-sm leading-tight flex-1">
                  {item.title}
                </span>
                <time className="text-xs text-muted-foreground shrink-0">
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
    stripHtml,
    formatDate,
  ]);

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
      }
    },
    [setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">Search</DialogTitle>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search for content..."
          value={searchQuery}
          onValueChange={handleSearchChange}
          className="border-none focus-visible:ring-0"
        />
        <CommandList>{searchResultsContent}</CommandList>
      </Command>
    </CommandDialog>
  );
}

// Utility function for debouncing

export default SearchCommandDialog;
