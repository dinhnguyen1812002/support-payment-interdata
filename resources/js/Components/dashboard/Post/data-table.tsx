import React, { useState, useEffect } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ticket,
  Search,
  Filter,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/Components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { Inertia } from '@inertiajs/inertia';
import Pagination from '@/Components/Pagination';

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number;
  to: number;
  links: Array<{
    page: number;
    url: string | null;
    active: boolean;
  }>;
}

interface DataTableProps {
  columns: any[];
  data: any[];
  pagination: PaginationData;
  filters: any;
  onPageChange: (url: string | null) => void;
  isLoading?: boolean;
}

export function DataTable({
  columns,
  data,
  pagination,
  filters,
  onPageChange,
  isLoading = false
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });



  // Hàm xử lý tìm kiếm với debounce
  const handleSearch = React.useCallback(
    debounce((value: string) => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);

      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');

      Inertia.get(
        currentUrl.pathname,
        Object.fromEntries(params),
        {
          preserveState: true,
          replace: true,
          only: ['data', 'pagination', 'filters'],
          preserveScroll: true,
        }
      );
    }, 500),
    [],
  );

  // Hàm xử lý thay đổi trạng thái
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');

    Inertia.get(
      currentUrl.pathname,
      Object.fromEntries(params),
      {
        preserveState: true,
        replace: true,
        only: ['data', 'pagination', 'filters'],
        preserveScroll: true,
      }
    );
  };

  // Hàm xử lý thay đổi số lượng item mỗi trang
  const handlePerPageChange = (value: string) => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    params.set('per_page', value);
    params.set('page', '1');

    Inertia.get(
      currentUrl.pathname,
      Object.fromEntries(params),
      {
        preserveState: true,
        replace: true,
        only: ['data', 'pagination', 'filters'],
        preserveScroll: true,
      }
    );
  };

  // Hàm xử lý sắp xếp
  const handleSort = (field: string) => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    const currentSort = params.get('sort');
    const currentDirection = params.get('direction');

    let newDirection = 'asc';
    if (currentSort === field && currentDirection === 'asc') {
      newDirection = 'desc';
    }

    params.set('sort', field);
    params.set('direction', newDirection);
    params.set('page', '1');

    Inertia.get(
      currentUrl.pathname,
      Object.fromEntries(params),
      {
        preserveState: true,
        replace: true,
        only: ['data', 'pagination', 'filters'],
        preserveScroll: true,
      }
    );
  };

  // Effect để cập nhật search value và status filter khi props thay đổi
  useEffect(() => {
    setSearchValue(filters?.search || '');
    setStatusFilter(filters?.status || 'all');
  }, [filters]);

  // Debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    return (...args: Parameters<T>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              All Tickets
            </CardTitle>
            <CardDescription>Manage and track your tickets</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchValue}
                onChange={event => {
                  setSearchValue(event.target.value);
                  handleSearch(event.target.value);
                }}
                className="pl-8 w-full sm:w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={handlePerPageChange}
              value={pagination.per_page.toString()}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-left cursor-pointer"
                      onClick={() => {
                        if (header.column.columnDef.id) {
                          handleSort(header.column.columnDef.id);
                        }
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing <span className="font-medium">{pagination.from}</span> to{' '}
            <span className="font-medium">{pagination.to}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> tickets
          </div>
          <div className="flex items-center gap-2">
          {pagination && pagination.total > 0 && (
              <Pagination
               
               current_page={pagination.current_page} 
               last_page={pagination.last_page} 
               next_page_url={pagination.next_page_url} 
               prev_page_url={pagination.prev_page_url} />
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}

