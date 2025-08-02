import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { PageProps } from '@inertiajs/core';
import React, { useState, useEffect } from 'react';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { NavigationProgress } from '@/Components/ui/navigation-progress';
import { AdvancedTicketTable } from '@/Components/dashboard/advanced-ticket-table';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

interface User {
  name: string;
  email: string;
  profile_photo_url: string | null;
}

interface Post {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    profile_photo_url: string | null;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
    profile_photo_url: string | null;
  };
  department?: {
    id: number;
    name: string;
  };
  comment?: number;
  priority_score?: number;
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

interface DashboardData {
  ticketStats: {
    urgentTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
  };
  posts: Array<{
    id: number;
    status: string;
    priority: string;
    title: string;
    created_at: string;
    user: {
      id: number;
      name: string;
      email: string;
      profile_photo_url: string | null;
    };
    assignee?: {
      id: number;
      name: string;
      email: string;
      profile_photo_url: string | null;
    };
    department?: {
      id: number;
      name: string;
    };
  }>;
  totalPosts: number;
  totalUsers: number;
  automation_stats: AutomationStats;
}

interface DashboardProps extends PageProps {
  data: DashboardData;
  assignableUsers: Array<{
    id: number;
    name: string;
    email: string;
    profile_photo_url: string | null;
  }>;
}

export default function Page({ data, assignableUsers = [] }: DashboardProps) {
  // Initialize default values
  const defaultTicketStats = {
    urgentTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0
  };

  // Destructure data with defaults
  const { 
    ticketStats = defaultTicketStats,
    totalPosts = 0, 
    totalUsers = 0, 
    automation_stats = {},
    posts = []
  } = data || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate ticket statistics
  const calculatedTicketStats = React.useMemo(() => {
    const openTickets = posts.filter((post: { status: string }) => post.status === 'open').length;
    const inProgressTickets = posts.filter((post: { status: string }) => post.status === 'in_progress').length;
    const urgentTickets = posts.filter((post: { priority: string, status: string }) => 
      post.priority === 'urgent' && post.status !== 'resolved'
    ).length;
    const resolvedTickets = posts.filter((post: { status: string }) => post.status === 'resolved').length;
    const closedTickets = posts.filter((post: { status: string }) => post.status === 'closed').length;
    const unassignedTickets = posts.filter((post: { assignee?: { id: number; name: string; email: string; profile_photo_url: string | null } }) => !post.assignee).length;

    return {
      openTickets,
      inProgressTickets,
      urgentTickets,
      resolvedTickets,
      closedTickets,
      unassignedTickets,
      totalTickets: posts.length,
    };
  }, [posts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <Head title={'Bảng điều khiển hỗ trợ'} />
      <NavigationProgress />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Bảng điều khiển hỗ trợ'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {ticketStats.urgentTickets > 0 && (
                <div className="mx-4 lg:mx-6">
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="flex items-center gap-3 p-4">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {ticketStats.urgentTickets} ticket khẩn cấp
                        </p>
                      </div>
                      <Badge variant="destructive">{ticketStats.urgentTickets}</Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
              <AdvancedTicketTable
                posts={posts}
                refreshKey={refreshKey}
                onRefresh={() => setRefreshKey(prev => prev + 1)}
                assignableUsers={assignableUsers} 
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}  