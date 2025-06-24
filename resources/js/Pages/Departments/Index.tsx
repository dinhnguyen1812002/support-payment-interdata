import React, { useState } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/Components/ui/card';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/react';
import DepartmentDialog from '@/Pages/Departments/department-form';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { DataTable } from '@/Components/dashboard/Post/data-table';
import { columns } from '@/Components/dashboard/Post/columns';

interface Department {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  slug: string;
}

interface Props {
  departments?: {
    data: Department[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  keyword?: string;
  notifications?: any[];
}

export default function DepartmentCards({
  departments,
  keyword = '',
  notifications = [],
}: Props) {
  const [search, setSearch] = useState(keyword);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >(undefined);

  const handleSearch = () => {
    Inertia.get('/departments', { search }, { preserveState: true });
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedDepartment(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (department: Department) => {
    setDialogMode('edit');
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  if (!departments || !departments.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Department'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">
              <div className="w-full">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                  <CardTitle>Departments</CardTitle>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Input
                        type="search"
                        placeholder="Search departments..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="pr-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                      </Button>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={openCreateDialog}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {departments.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {departments.data.map(department => (
                        <Card
                          key={department.id}
                          className="h-full overflow-hidden border shadow-xs"
                        >
                          <CardHeader className="p-3 pb-2">
                            <CardTitle className="text-base truncate uppercase">
                              {department.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                              {department.description ||
                                'No description available'}
                            </p>
                          </CardContent>
                          <CardFooter className="p-2 flex justify-between gap-1 border-t bg-muted/10">
                            <div className="flex gap-1">
                              <Link href={`/departments/${department.slug}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => openEditDialog(department)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Are you sure you want to delete this department?',
                                    )
                                  ) {
                                    Inertia.delete(
                                      `/departments/${department.id}`,
                                      {
                                        onSuccess: () => {
                                          Inertia.reload();
                                        },
                                      },
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(department.created_at)}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 border rounded-md">
                      <p className="text-muted-foreground">
                        No departments found.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        departments.prev_page_url &&
                        Inertia.get(departments.prev_page_url)
                      }
                      disabled={!departments.prev_page_url}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Page {departments.current_page} of {departments.last_page}{' '}
                      (Total: {departments.total} departments)
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        departments.next_page_url &&
                        Inertia.get(departments.next_page_url)
                      }
                      disabled={!departments.next_page_url}
                      className="w-full sm:w-auto"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </div>

              <DepartmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                department={selectedDepartment}
                mode={dialogMode}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
