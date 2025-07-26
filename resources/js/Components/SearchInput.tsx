import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
  maxHistoryItems?: number;
  storageKey?: string;
  suggestions?: string[];
  size?: 'sm' | 'md' | 'lg';
  enableApiSuggestions?: boolean;
  apiSuggestionsUrl?: string;
}

export function SearchInput({
  value = '',
  placeholder = 'Tìm kiếm...',
  onSearch,
  onClear,
  className = '',
  showHistory = true,
  showSuggestions = true,
  debounceMs = 500,
  maxHistoryItems = 5,
  storageKey = 'search-history',
  suggestions = [],
  size = 'md',
  enableApiSuggestions = false,
  apiSuggestionsUrl = '/api/search/suggestions',
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularSearches] = useState(['lỗi', 'yêu cầu tính năng', 'khẩn cấp', 'thanh toán', 'đăng nhập']);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    if (showHistory) {
      const savedHistory = localStorage.getItem(storageKey);
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.warn('Failed to parse search history:', error);
        }
      }
    }
  }, [showHistory, storageKey]);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

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

  // Save search to history
  const saveSearchToHistory = (search: string) => {
    if (!showHistory || !search.trim() || search.length < 2) return;
    
    const newHistory = [search, ...searchHistory.filter(item => item !== search)]
      .slice(0, maxHistoryItems);
    setSearchHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  // Handle search with debounce
  const handleSearchChange = (newValue: string) => {
    setSearchTerm(newValue);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (newValue.trim()) {
        saveSearchToHistory(newValue.trim());
      }
      onSearch(newValue.trim());
    }, debounceMs);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchTerm.trim()) {
      saveSearchToHistory(searchTerm.trim());
      onSearch(searchTerm.trim());
    }
    setShowDropdown(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    onClear?.();
    setShowDropdown(false);
  };

  // Select search suggestion
  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    saveSearchToHistory(suggestion);
    onSearch(suggestion);
    setShowDropdown(false);
  };

  // Remove search from history
  const removeFromHistory = (searchToRemove: string) => {
    const newHistory = searchHistory.filter(item => item !== searchToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 text-sm';
      case 'lg':
        return 'h-12 text-base';
      default:
        return 'h-10 text-sm';
    }
  };

  const hasContent = searchHistory.length > 0 || suggestions.length > 0 || apiSuggestions.length > 0 || popularSearches.length > 0;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            className={cn('pl-10 pr-10', getSizeClasses())}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => showSuggestions && hasContent && setShowDropdown(true)}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {showDropdown && showSuggestions && hasContent && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tìm kiếm gần đây
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={`history-${index}`}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer group"
                    onClick={() => selectSuggestion(item)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm truncate">{item}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* API Suggestions */}
            {enableApiSuggestions && apiSuggestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  {isLoadingSuggestions && (
                    <div className="animate-spin h-3 w-3 border border-muted-foreground border-t-transparent rounded-full"></div>
                  )}
                  Gợi ý thông minh
                </div>
                {apiSuggestions.map((item, index) => (
                  <div
                    key={`api-suggestion-${index}`}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => selectSuggestion(item)}
                  >
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">
                  Gợi ý
                </div>
                {suggestions.map((item, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => selectSuggestion(item)}
                  >
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && !searchTerm && (
              <div>
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Tìm kiếm phổ biến
                </div>
                {popularSearches.map((item, index) => (
                  <div
                    key={`popular-${index}`}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => selectSuggestion(item)}
                  >
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Search Badge */}
      {value && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            <Search className="h-3 w-3 mr-1" />
            Đang tìm: "{value}"
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-muted-foreground/20"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}

export default SearchInput;
