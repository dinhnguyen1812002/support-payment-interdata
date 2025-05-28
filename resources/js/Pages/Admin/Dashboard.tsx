import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { PageProps } from '@inertiajs/core';
import React from 'react';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { SectionCards } from '@/Components/dashboard/section-cards';
import { DataTable } from '@/Components/dashboard/data-table';

interface User {
  name: string;
  email: string;
  profile_photo_path: string | null;
}

interface Post {
  id: number;
  title: string;
  status: boolean;
  vote: string;
  comment: number;
  user: User;
}

interface DashboardProps extends PageProps {
  posts: Post[];
  user: User;
  totalPosts: number;
  totalUsers: number;
}

export default function Page({
  posts,
  user,
  totalPosts,
  totalUsers,
}: DashboardProps) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Dashboard'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards totalPosts={totalPosts} totalUsers={totalUsers} />
              <DataTable data={posts} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
