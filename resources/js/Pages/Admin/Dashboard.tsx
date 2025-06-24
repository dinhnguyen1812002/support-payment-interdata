import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { PageProps } from '@inertiajs/core';
import React from 'react';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { SectionCards } from '@/Components/dashboard/section-cards';
import { DataTable } from '@/Components/dashboard/data-table';
import { Head } from '@inertiajs/react';

interface User {
  name: string;
  email: string;
  profile_photo_path: string | null;
}

interface Post {
  id: number;
  title: string;
  is_published: boolean;
  vote: string;
  comment: number;
  user: User;
}

interface AutomationStats {
  total_rules: number;
  active_rules: number;
  total_matches: number;
  recent_matches: number;
  top_rules: Array<{
    id: number;
    name: string;
    matched_count: number;
  }>;
}

interface DashboardProps extends PageProps {
  posts: Post[];
  user: User;
  totalPosts: number;
  totalUsers: number;
  automation_stats: AutomationStats;
}

export default function Page({
  posts,
  user,
  totalPosts,
  totalUsers,
  automation_stats,
}: DashboardProps) {
  return (
    <SidebarProvider>
      <Head title={'Dashboard'} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Dashboard'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards totalPosts={totalPosts} totalUsers={totalUsers} automationStats={automation_stats} />
              <DataTable data={posts} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
