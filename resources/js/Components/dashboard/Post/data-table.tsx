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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
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
  };
  filters?: {
    search: string;
    status: string;
    date_from: string;
    date_to: string;
    sort: string;
    direction: string;
  };
  onPageChange: (url: string | null) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  filters,
  onPageChange,
}: DataTableProps<TData, TValue>) {
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

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

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

      Inertia.visit(`${currentUrl.pathname}?${params.toString()}`, {
        preserveState: true,
        preserveScroll: true,
        only: ['data', 'pagination', 'filters'],
      });
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

    Inertia.visit(`${currentUrl.pathname}?${params.toString()}`, {
      preserveState: true,
      preserveScroll: true,
      only: ['data', 'pagination', 'filters'],
    });
  };

  // Hàm xử lý thay đổi số lượng item mỗi trang
  const handlePerPageChange = (value: string) => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    params.set('per_page', value);
    params.set('page', '1');

    Inertia.visit(`${currentUrl.pathname}?${params.toString()}`, {
      preserveState: true,
      preserveScroll: true,
      only: ['data', 'pagination', 'filters'],
    });
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

    Inertia.visit(`${currentUrl.pathname}?${params.toString()}`, {
      preserveState: true,
      preserveScroll: true,
      only: ['data', 'pagination', 'filters'],
    });
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
    // let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      // clearTimeout(timeout);
      // timeout = setTimeout(() => func(...args), wait);
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-muted/50 transition-colors text-left"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <Ticket className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                      <p className="text-muted-foreground">No tickets found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter
                      </p>
                    </div>
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
            {pagination.links.map((link, index) => (
              <Button
                key={index}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(link.url)}
                disabled={!link.url || link.active}
                className={link.url ? '' : 'opacity-50 cursor-not-allowed'}
              >
                {link.page}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
