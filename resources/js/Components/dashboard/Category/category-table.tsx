import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import { Skeleton } from '@/Components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Pencil,
  Trash,
} from 'lucide-react';
import type { Category, Paginate } from '@/types';

interface CategoryTableProps {
  data: Category[];
  pagination: Paginate;
  isLoading: boolean;
  searchTerm: string;
  handleEdit: (category: Category) => void;
  handleDelete: (category: Category) => void;
  handleClearSearch: () => void;
  handlePageChange: (url: string | null) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  renderSortIcon: (field: string) => React.ReactNode;
}

export default function CategoryTable({
  data,
  pagination,
  isLoading,
  searchTerm,
  handleEdit,
  handleDelete,
  handleClearSearch,
  handlePageChange,
  sortField,
  sortDirection,
  handleSort,
  renderSortIcon,
}: CategoryTableProps) {
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  {renderSortIcon('title')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('slug')}
              >
                <div className="flex items-center">
                  Slug
                  {renderSortIcon('slug')}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="text-center cursor-pointer"
                onClick={() => handleSort('posts_count')}
              >
                <div className="flex items-center justify-center">
                  Posts Count
                  {renderSortIcon('posts_count')}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            ) : data.length > 0 ? (
              data.map(category => (
                <TableRow key={category.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{category.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate text-sm text-muted-foreground">
                      {category.description || (
                        <span className="italic text-muted-foreground/60">
                          No description
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono">{category.posts_count}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-70 group-hover:opacity-100"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit category</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive opacity-70 group-hover:opacity-100"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete category</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No categories found.
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearSearch}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">
            {(pagination.current_page - 1) * pagination.per_page + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total,
            )}
          </span>{' '}
          of <span className="font-medium">{pagination.total}</span> categories
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.prev_page_url)}
            disabled={!pagination.prev_page_url || isLoading}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(pagination.last_page, 5) },
              (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === pagination.current_page;

                return (
                  <Button
                    key={i}
                    variant={isCurrentPage ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    disabled={isCurrentPage || isLoading}
                    onClick={() =>
                      handlePageChange(
                        `${window.location.pathname}?page=${pageNum}`,
                      )
                    }
                  >
                    {pageNum}
                  </Button>
                );
              },
            )}

            {pagination.last_page > 5 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.next_page_url)}
            disabled={!pagination.next_page_url || isLoading}
            className="h-8"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}
