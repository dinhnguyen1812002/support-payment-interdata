import React, { useState, useEffect } from 'react';
import { DataTable } from '@/Components/dashboard/Post/data-table';
import { columns } from '@/Components/dashboard/Post/columns';
import { Head, usePage } from '@inertiajs/react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { PageTransition } from '@/Components/ui/page-transition';
import { Inertia } from '@inertiajs/inertia';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Loader2 } from 'lucide-react';

export type Post = {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'private';
  votes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
};

type Pagination = {
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

export default function PostsPage() {
  const { props } = usePage();
  const initialData = props.data as Post[];
  const initialPagination = props.pagination as Pagination;

  const [data, setData] = useState(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state when props change (e.g., when filters are applied)
  useEffect(() => {
    setData(props.data as Post[]);
    setPagination(props.pagination as Pagination);
  }, [props.data, props.pagination]);

  const handlePageChange = (url: string | null) => {
    if (url) {
      setLoading(true);
      setError(null);
      
      Inertia.visit(url, {
        preserveState: true,
        preserveScroll: true,
        only: ['data', 'pagination', 'filters'],
        onSuccess: page => {
          if (page.props.data && Array.isArray(page.props.data)) {
            setData(page.props.data as Post[]);
            setPagination(page.props.pagination as Pagination);
          } else {
            setError('Received invalid data format from server');
          }
        },
        onError: (errors) => {
          console.error('Pagination error:', errors);
          setError('Failed to load data. Please try again.');

          // Handle 409 conflicts specifically
          if (errors.message && errors.message.includes('409')) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        },
        onFinish: () => {
          setLoading(false);
        }
      });
    }
  };

  return (
    <SidebarProvider>
      <Head title="Tickets" />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="All Tickets" />
        <PageTransition>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {error && (
                <Alert variant="destructive" className="mx-4 mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">
                {loading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                <DataTable
                  columns={columns}
                  data={data}
                  pagination={pagination}
                  filters={props.filters as any}
                  onPageChange={handlePageChange}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}

