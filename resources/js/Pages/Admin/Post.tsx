import React, { useState } from 'react';
import { DataTable } from '@/Components/dashboard/Post/data-table';
import { columns } from '@/Components/dashboard/Post/columns';
import { Head, usePage } from '@inertiajs/react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { PageTransition } from '@/Components/ui/page-transition';
import { Inertia } from '@inertiajs/inertia';

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

  const handlePageChange = (url: string | null) => {
    if (url) {
      // Add loading state and error handling
      Inertia.visit(url, {
        preserveState: true,
        preserveScroll: true,
        only: ['data', 'pagination', 'filters'],
        onStart: () => {
          // Could add loading state here
        },
        onSuccess: page => {
          setData(page.props.data as Post[]);
          setPagination(page.props.pagination as Pagination);
        },
        onError: (errors) => {
          console.error('Pagination error:', errors);

          // Handle 409 conflicts specifically
          if (errors.message && errors.message.includes('409')) {
            // Retry after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        },
        onFinish: () => {
          // Could remove loading state here
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
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">
                <DataTable
                  columns={columns}
                  data={data}
                  pagination={pagination}
                  filters={props.filters as any}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
