import React from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
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
  CardDescription,
  CardHeader,
  CardTitle,
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
  };
  onPageChange: (url: string | null) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  // Thêm hàm xử lý thay đổi số lượng item mỗi trang
  const handlePerPageChange = (value: string) => {
    Inertia.visit(window.location.pathname, {
      data: {
        per_page: value,
        page: 1, // Reset về trang 1 khi thay đổi số lượng item
      },
      preserveState: true,
      preserveScroll: true,
      only: ['data', 'pagination'],
      onSuccess: () => {
        // Có thể thêm logic xử lý sau khi thành công
      },
    });
  };

  return (
    <div className="w-full shadow-sm ">
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
                value={
                  (table.getColumn('title')?.getFilterValue() as string) ?? ''
                }
                onChange={event =>
                  table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full sm:w-[250px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => table.getColumn('status')?.setFilterValue('')}
                  className="justify-between"
                >
                  All statuses
                  {!table.getColumn('status')?.getFilterValue() && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    table.getColumn('status')?.setFilterValue('published')
                  }
                  className="justify-between"
                >
                  Published
                  {table.getColumn('status')?.getFilterValue() ===
                    'published' && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    table.getColumn('status')?.setFilterValue('draft')
                  }
                  className="justify-between"
                >
                  Draft
                  {table.getColumn('status')?.getFilterValue() === 'draft' && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    table.getColumn('status')?.setFilterValue('archived')
                  }
                  className="justify-between"
                >
                  Archived
                  {table.getColumn('status')?.getFilterValue() ===
                    'archived' && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                      className="font-semibold text-left"
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
            Showing <span className="font-medium">{data.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> tickets
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(`/admin/posts?page=1`)}
                disabled={pagination.current_page === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(pagination.prev_page_url)}
                disabled={!pagination.prev_page_url}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm mx-2">
                <span className="font-medium">{pagination.current_page}</span>
                {' / '}
                <span>{pagination.last_page}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(pagination.next_page_url)}
                disabled={!pagination.next_page_url}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  onPageChange(`/admin/posts?page=${pagination.last_page}`)
                }
                disabled={pagination.current_page === pagination.last_page}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
