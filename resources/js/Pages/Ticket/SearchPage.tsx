import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Search, Filter, Clock, TrendingUp, X } from 'lucide-react';
import TicketLayout from '@/Layouts/TicketLayout';
import { TicketCard } from './TicketCard';
import { SearchInput } from '@/Components/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { router } from '@inertiajs/react';
import { Ticket } from '@/types/ticket';

interface SearchPageProps {
  tickets: Ticket[];
  query: string;
  totalResults: number;
  searchTime: number;
  suggestions: string[];
  categories: any[];
  tags: any[];
  departments: any[];
  users: any[];
  filters: {
    search?: string;
    category?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
  };
  notifications: any[];
}

export default function SearchPage({
  tickets = [],
  query = '',
  totalResults = 0,
  searchTime = 0,
  suggestions = [],
  categories = [],
  tags = [],
  departments = [],
  users = [],
  filters = {},
  notifications = [],
}: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Handle new search
  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.get(`/tickets/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  // Handle ticket click
  const handleTicketClick = (ticket: Ticket) => {
    router.get(`/tickets/${ticket.slug}`);
  };

  // Clear search
  const clearSearch = () => {
    router.get('/tickets');
  };

  // Update filters
  const updateFilters = (newFilters: any) => {
    const searchParams = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };

    // Always include the search query
    if (query) {
      searchParams.set('q', query);
    }

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'search') {
        searchParams.set(key, value.toString());
      }
    });

    router.get(`/tickets/search?${searchParams.toString()}`);
  };

  return (
    <TicketLayout
      title="Kết quả tìm kiếm"
      categories={categories}
      departments={departments}
      users={users}
      tags={tags}
      filters={filters}
      notifications={notifications}
      showTabs={false}
      showCreateButton={true}
      showLable={false}
    >
      <Head title={`Tìm kiếm: ${query}`} />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.get('/tickets')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Quay lại danh sách yêu cầu
              </Button>
            </div>

            {/* Main Search Input */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <SearchInput
                    value={searchQuery}
                    placeholder="Tìm kiếm yêu cầu hỗ trợ, danh mục, người dùng..."
                    onSearch={handleSearch}
                    onClear={clearSearch}
                    showHistory={true}
                    showSuggestions={true}
                    storageKey="global-search-history"
                    suggestions={suggestions}
                    size="lg"
                    className="w-full"
                  />

                  {/* Search Stats */}
                  {query && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>
                        Tìm thấy <strong>{totalResults}</strong> kết quả cho "<strong>{query}</strong>"
                        {searchTime > 0 && ` trong ${searchTime}ms`}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showAdvancedFilters ? 'Ẩn' : 'Hiện'} bộ lọc
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bộ lọc nâng cao</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trạng thái</label>
                      <select
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={filters.status || ''}
                        onChange={(e) => updateFilters({ status: e.target.value || undefined })}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="open">Mở</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã giải quyết</option>
                        <option value="closed">Đã đóng</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Độ ưu tiên</label>
                      <select
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={filters.priority || ''}
                        onChange={(e) => updateFilters({ priority: e.target.value || undefined })}
                      >
                        <option value="">Tất cả độ ưu tiên</option>
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                        <option value="urgent">Khẩn cấp</option>
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sắp xếp theo</label>
                      <select
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={filters.sortBy || 'relevance'}
                        onChange={(e) => updateFilters({ sortBy: e.target.value })}
                      >
                        <option value="relevance">Liên quan</option>
                        <option value="latest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="upvotes">Nhiều upvote nhất</option>
                        <option value="priority">Độ ưu tiên</option>
                        <option value="inactive">Không hoạt động trước</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {Object.entries(filters).some(([key, value]) => value && key !== 'search') && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">Bộ lọc đang áp dụng:</span>
                        {Object.entries(filters).map(([key, value]) => {
                          if (!value || key === 'search') return null;
                          return (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-muted-foreground/20"
                                onClick={() => updateFilters({ [key]: undefined })}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFilters({ status: undefined, priority: undefined, sortBy: undefined })}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Results */}
          {query ? (
            <div className="space-y-4">
              {tickets.length > 0 ? (
                <Card className="overflow-hidden">
                  <div className="divide-y">
                    {tickets.map(ticket => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => handleTicketClick(ticket)}
                      />
                    ))}
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Chúng tôi không thể tìm thấy yêu cầu hỗ trợ nào phù hợp với "{query}". Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.
                    </p>
                    
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Thử tìm kiếm:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSearch(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Bắt đầu tìm kiếm</h3>
                <p className="text-muted-foreground">
                  Nhập từ khóa tìm kiếm ở trên để tìm yêu cầu hỗ trợ, danh mục hoặc người dùng.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TicketLayout>
  );
}
