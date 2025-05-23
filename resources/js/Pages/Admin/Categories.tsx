import React, { useCallback, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  FolderOpen,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';

import type { Category } from '@/types';

import { useCategoryStore } from '@/Store/categoryStore.ts';
import CategoryDialogForm from '@/Pages/Categories/category-form';
import CategoryTable from '@/Components/dashboard/Category/category-table';

type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};

export default function Categories() {
  const { props } = usePage();
  const initialData = props.data as Category[];
  const initialPagination = props.pagination as Pagination;

  const {
    data,
    pagination,
    searchTerm,
    deleteDialogOpen,
    categoryToDelete,
    categoryDialogOpen,
    categoryToEdit,
    setData,
    setPagination,
    setSearchTerm,
    setDeleteDialogOpen,
    setCategoryToDelete,
    setCategoryDialogOpen,
    setCategoryToEdit,
  } = useCategoryStore();

  const [isLoading, setIsLoading] = React.useState(false);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'asc',
  );

  // Initialize data from props
  useEffect(() => {
    setData(initialData);
    setPagination(initialPagination);
  }, [initialData, initialPagination, setData, setPagination]);

  const handlePageChange = useCallback(
    (url: string | null) => {
      if (url) {
        setIsLoading(true);
        Inertia.visit(url, {
          preserveState: true,
          preserveScroll: true,
          only: ['data', 'pagination'],
          onSuccess: page => {
            setData(page.props.data as Category[]);
            setPagination(page.props.pagination as Pagination);
            setIsLoading(false);
          },
          onError: () => {
            setIsLoading(false);
          },
        });
      }
    },
    [setData, setPagination],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      Inertia.get(
        window.location.pathname,
        { search: searchTerm },
        {
          preserveState: true,
          preserveScroll: true,
          only: ['data', 'pagination'],
          onSuccess: page => {
            setData(page.props.data as Category[]);
            setPagination(page.props.pagination as Pagination);
            setIsLoading(false);
          },
          onError: () => {
            setIsLoading(false);
          },
        },
      );
    },
    [searchTerm, setData, setPagination],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setIsLoading(true);
    Inertia.get(
      window.location.pathname,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['data', 'pagination'],
        onSuccess: page => {
          setData(page.props.data as Category[]);
          setPagination(page.props.pagination as Pagination);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  }, [setSearchTerm, setData, setPagination]);

  const handleAddNew = useCallback(() => {
    setCategoryToEdit(null);
    setCategoryDialogOpen(true);
  }, [setCategoryToEdit, setCategoryDialogOpen]);

  const handleEdit = useCallback(
    (category: Category) => {
      setCategoryToEdit(category);
      setCategoryDialogOpen(true);
    },
    [setCategoryToEdit, setCategoryDialogOpen],
  );

  const handleDelete = useCallback(
    (category: Category) => {
      setCategoryToDelete(category);
      setDeleteDialogOpen(true);
    },
    [setCategoryToDelete, setDeleteDialogOpen],
  );

  const confirmDelete = useCallback(() => {
    if (categoryToDelete) {
      setIsLoading(true);
      Inertia.delete(`/admin/categories/${categoryToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      });
    }
  }, [categoryToDelete, setDeleteDialogOpen, setCategoryToDelete]);

  const handleFormSuccess = useCallback(() => {
    setIsLoading(true);
    Inertia.reload({
      only: ['data', 'pagination'],
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  }, []);

  const handleCategoryDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setCategoryToEdit(null);
      }
      setCategoryDialogOpen(open);
    },
    [setCategoryToEdit, setCategoryDialogOpen],
  );

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }

      // In a real app, you would send the sort parameters to the server
      // For this example, we'll just sort the data client-side
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[field as keyof Category];
        const bValue = b[field as keyof Category];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });

      setData(sortedData);
    },
    [data, setData, sortField, sortDirection],
  );

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/70" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronLeft className="ml-1 h-4 w-4 rotate-90" />
    ) : (
      <ChevronRight className="ml-1 h-4 w-4 -rotate-90" />
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Categories'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Categories
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Manage your content categories and organization
                      </CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <form
                        onSubmit={handleSearch}
                        className="flex w-full max-w-sm items-center space-x-2"
                      >
                        <div className="relative w-full">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-10"
                          />
                          {searchTerm && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full aspect-square rounded-l-none"
                              onClick={handleClearSearch}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Clear search</span>
                            </Button>
                          )}
                        </div>
                      </form>
                      <Button
                        onClick={handleAddNew}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Category
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CategoryTable
                    data={data}
                    pagination={pagination}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleClearSearch={handleClearSearch}
                    handlePageChange={handlePageChange}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    renderSortIcon={renderSortIcon}
                  />
                </CardContent>
              </Card>

              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete the category "
                      {categoryToDelete?.title}". This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDelete}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <CategoryDialogForm
                open={categoryDialogOpen}
                onOpenChange={handleCategoryDialogOpenChange}
                initialData={categoryToEdit || undefined}
                isEditing={!!categoryToEdit}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
