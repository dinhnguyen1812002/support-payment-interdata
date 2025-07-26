import { Filter, User, Users } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { router } from "@inertiajs/react";
import React from "react";
import { CategoryFilter } from "@/Components/CategoryFilter";
import { SearchInput } from "@/Components/SearchInput";

interface FilterSidebarProps {
  categories?: any[];
  departments?: any[];
  users?: any[];
  filters?: {
    search?: string;
    status?: string;
    priority?: string;
    department?: string;
    assignee?: string;
    category?: string;
    myTickets?: boolean;
    sortBy?: string;
  };
  currentUser?: any;
  searchSuggestions?: string[];
}

const sortOptions = [
  { value: "newest", label: "Mới nhất trước" },
  { value: "oldest", label: "Cũ nhất trước" },
  { value: "most-upvoted", label: "Nhiều upvote nhất" },
  { value: "most-replies", label: "Nhiều phản hồi nhất" },
];

const priorities = [
  { value: "low", label: "Thấp", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Trung bình", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Cao", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Khẩn cấp", color: "bg-red-100 text-red-800" },
];

const statuses = [
  { value: "open", label: "Mở", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  { value: "resolved", label: "Đã giải quyết", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
];

export function FilterSidebar({
  categories = [],
  departments = [],
  users = [],
  filters = {},
  currentUser,
  searchSuggestions = []
}: FilterSidebarProps) {

  const updateFilters = (newFilters: any) => {
    const searchParams = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'false' && value !== false) {
        searchParams.set(key, value.toString());
      }
    });

    router.get(`/tickets?${searchParams.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    router.get('/tickets', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="w-full h-full bg-card border-r flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b">
        {/* Header - Show on mobile */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Enhanced Search - Always visible */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-sm font-medium">Tìm kiếm</label>
          <SearchInput
            value={filters.search || ''}
            placeholder="Tìm kiếm yêu cầu hỗ trợ..."
            onSearch={(value) => updateFilters({ search: value || undefined })}
            onClear={() => updateFilters({ search: undefined })}
            showHistory={true}
            showSuggestions={true}
            storageKey="ticket-search-history"
            suggestions={searchSuggestions}
            enableApiSuggestions={true}
            apiSuggestionsUrl="/api/search/suggestions"
            size="md"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Separator className="lg:hidden mb-4" />
          
          {/* Category */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium">Danh mục</label>
            <CategoryFilter
              categories={categories}
              value={filters.category}
              onValueChange={(value) => updateFilters({ category: value })}
              showPostCount={true}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium">Độ ưu tiên</label>
            <Select
              value={filters.priority || ""}
              onValueChange={(value) =>
                updateFilters({
                  priority: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${priority.color}`}>
                        {priority.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select
              value={filters.status || ""}
              onValueChange={(value) =>
                updateFilters({
                  status: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium">Sắp xếp theo</label>
            <Select
              value={filters.sortBy || "newest"}
              onValueChange={(value) =>
                updateFilters({ sortBy: value === "newest" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters - Show on mobile */}
          {hasActiveFilters && (
            <div className="space-y-2 sm:space-y-3 lg:hidden">
              <Separator />
              <label className="text-sm font-medium">Bộ lọc đang áp dụng</label>
              <div className="flex flex-wrap gap-2">
                {filters.myTickets && (
                  <Badge variant="secondary" className="text-xs">
                    Yêu cầu của tôi
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    {
                      categories.find((c) => c.id.toString() === filters.category)
                        ?.title || 'Danh mục'
                    }
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary" className="text-xs">
                    {
                      priorities.find((p) => p.value === filters.priority)
                        ?.label || filters.priority
                    }
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">
                    {statuses.find((s) => s.value === filters.status)?.label || filters.status}
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Tìm kiếm: {filters.search}
                  </Badge>
                )}
                {filters.sortBy && filters.sortBy !== "newest" && (
                  <Badge variant="secondary" className="text-xs">
                    Sắp xếp:{" "}
                    {sortOptions.find((s) => s.value === filters.sortBy)?.label}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


