import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'ticket' | 'category' | 'user';
  slug?: string;
  excerpt?: string;
  category?: string;
  status?: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showShortcut?: boolean;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  isLoading?: boolean;
}

export function SearchBar({
  className = '',
  placeholder = 'Search tickets, categories...',
  showShortcut = true,
  onSearch,
  results = [],
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
      }

      // Arrow navigation
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
      onSearch?.(value);
    } else {
      setIsOpen(false);
    }
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'ticket':
        router.get(`/tickets/${result.slug}`);
        break;
      case 'category':
        router.get(`/tickets?category=${result.slug}`);
        break;
      case 'user':
        router.get(`/tickets?assignee=${result.id}`);
        break;
    }
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.get(`/tickets/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  // Get result type icon and color
  const getResultTypeInfo = (type: string) => {
    switch (type) {
      case 'ticket':
        return { icon: '🎫', color: 'bg-blue-100 text-blue-800' };
      case 'category':
        return { icon: '📁', color: 'bg-green-100 text-green-800' };
      case 'user':
        return { icon: '👤', color: 'bg-purple-100 text-purple-800' };
      default:
        return { icon: '📄', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className={cn('relative max-w-md', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="global-search"
            type="text"
            placeholder={placeholder}
            className="pl-10 pr-20 bg-muted/50 border-0 focus:bg-background"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          {showShortcut && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <Command className="h-3 w-3 mr-1" />
                K
              </Badge>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => {
                const typeInfo = getResultTypeInfo(result.type);
                return (
                  <div
                    key={result.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                      index === selectedIndex 
                        ? 'bg-muted' 
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className={cn('text-xs', typeInfo.color)}>
                        {typeInfo.icon} {result.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.title}
                      </div>
                      {result.excerpt && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.excerpt}
                        </div>
                      )}
                      {result.category && (
                        <div className="text-xs text-muted-foreground">
                          in {result.category}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
              
              {/* Show all results link */}
              <div className="border-t border-border mt-2 pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    router.get(`/tickets/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search for "{query}" in all tickets
                </Button>
              </div>
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No results found for "{query}"</div>
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => {
                  router.get(`/tickets/search?q=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                }}
              >
                Search in all tickets
              </Button>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <div className="text-sm mb-2">Quick search</div>
              <div className="text-xs">
                Try searching for tickets, categories, or users
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
