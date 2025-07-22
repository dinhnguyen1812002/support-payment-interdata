import { Search, Filter, User, Users } from "lucide-react";
import { Input } from "@/Components/ui/input";
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
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-upvoted", label: "Most Upvoted" },
  { value: "most-replies", label: "Most Replies" },
];

const priorities = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const statuses = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-100 text-purple-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

export function FilterSidebar({
  categories = [],
  departments = [],
  users = [],
  filters = {},
  currentUser
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
    <div className="w-full h-full bg-card p-6 border-r overflow-y-auto ">
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          {hasActiveFilters && (
            <Button variant={'ghost'} size="sm" onClick={clearFilters} className='text-white'>
              Clear all
            </Button>
          )}
        </div> */}

        {/* Search */}
        <div className="space-y-2">
          {/* <label className="text-sm font-medium">Search</label> */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={filters.search || ""}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
          <hr/>
      


        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={filters.category || ""}
            onValueChange={(value) =>
              updateFilters({
                category: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Priority</label>
          <Select
            value={filters.priority || ""}
            onValueChange={(value) =>
              updateFilters({
                priority: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
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
        <div className="space-y-3">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              updateFilters({
                status: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
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
        <div className="space-y-3">
          <label className="text-sm font-medium">Sort By</label>
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) =>
              updateFilters({ sortBy: value === "newest" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
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

        {/* Active Filters */}
        {/* {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-3">
              <label className="text-sm font-medium">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {filters.myTickets && (
                  <Badge variant="secondary" className="text-xs">
                    My Tickets
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    {
                      categories.find((c) => c.id.toString() === filters.category)
                        ?.title || 'Category'
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
                    Search: {filters.search}
                  </Badge>
                )}
                {filters.sortBy && filters.sortBy !== "newest" && (
                  <Badge variant="secondary" className="text-xs">
                    Sort:{" "}
                    {sortOptions.find((s) => s.value === filters.sortBy)?.label}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )} */}
      </div>
    </div>
  );
}


