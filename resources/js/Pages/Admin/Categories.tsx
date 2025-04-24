import React, { useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, Trash, Pencil } from 'lucide-react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import CategoryDialogForm from '@/Pages/Categories/category-form';
import { Category} from '@/types';
import { useCategoryStore } from '@/Store/categoryStore.ts';
type Pagination = {
    current_page: number
    last_page: number
    per_page: number
    total: number
    next_page_url: string | null
    prev_page_url: string | null
}
export default function Categories() {
    const { props } = usePage();
    const initialData = props.data as Category[];
    const initialPagination = props.pagination as Pagination;

    // Sử dụng Zustand thay vì useState
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

    // Khởi tạo dữ liệu ban đầu từ props
    React.useEffect(() => {
        setData(initialData);
        setPagination(initialPagination);
    }, [initialData, initialPagination, setData, setPagination]);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            Inertia.visit(url, {
                preserveState: true,
                preserveScroll: true,
                only: ['data', 'pagination'],
                onSuccess: (page) => {
                    setData(page.props.data as Category[]);
                    setPagination(page.props.pagination as Pagination);
                },
            });
        }
    }, [setData, setPagination]);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            Inertia.get(
                window.location.pathname,
                { search: searchTerm },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['data', 'pagination'],
                    onSuccess: (page) => {
                        setData(page.props.data as Category[]);
                        setPagination(page.props.pagination as Pagination);
                    },
                },
            );
        },
        [searchTerm, setData, setPagination],
    );

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
            Inertia.delete(`/admin/categories/${categoryToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setCategoryToDelete(null);
                },
            });
        }
    }, [categoryToDelete, setDeleteDialogOpen, setCategoryToDelete]);

    const handleFormSuccess = useCallback(() => {
        Inertia.reload({ only: ['data', 'pagination'] });
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

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={"Category"} />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 rounded-lg ml-4">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-bold">Categories</h1>
                                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" /> Add Category
                                    </Button>
                                </div>

                                <div className="flex items-center mb-6">
                                    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                                        <Input
                                            type="search"
                                            placeholder="Search categories..."
                                            value={searchTerm}

                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1"
                                        />
                                        {/*<Input*/}
                                        {/*    placeholder="Filter by title..."*/
                                        }
                                        {/*    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}*/}
                                        {/*    onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}*/}
                                        {/*    className="max-w-sm"*/}
                                        {/*/>*/}
                                        <Button type="submit" variant="outline" size="icon">
                                            <Search className="h-4 w-4" />
                                            <span className="sr-only">Search</span>
                                        </Button>
                                    </form>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-center">Posts Count</TableHead>
                                                <TableHead className="w-[80px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.length > 0 ? (
                                                data.map((category) => (
                                                    <TableRow key={category.id}>
                                                        <TableCell className="font-medium">{category.title}</TableCell>
                                                        <TableCell>{category.slug}</TableCell>
                                                        <TableCell className="max-w-[300px] truncate">{category.description}</TableCell>
                                                        <TableCell className="text-center">{category.posts_count}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleEdit(category)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleDelete(category)}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        No categories found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {data.length} of {pagination.total} categories
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.prev_page_url)}
                                            disabled={!pagination.prev_page_url}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <span className="text-sm">
                                          Page {pagination.current_page} of {pagination.last_page}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.next_page_url)}
                                            disabled={!pagination.next_page_url}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>

                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Are you sure you want to delete?</DialogTitle>
                                            <DialogDescription>
                                                This will permanently delete the category "{categoryToDelete?.title}". This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={confirmDelete}>
                                                Delete
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
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
