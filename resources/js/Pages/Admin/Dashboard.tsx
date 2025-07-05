import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { PageProps } from '@inertiajs/core';
import React, { useState, useEffect } from 'react';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { SectionCards } from '@/Components/dashboard/section-cards';

import { Head } from '@inertiajs/react';
// import { TicketAnalytics } from '@/Components/dashboard/ticket-analytics';
// import { QuickActions } from '@/Components/dashboard/quick-actions';
// import { RecentActivity } from '@/Components/dashboard/recent-activity';
import { PerformanceMetrics } from '@/Components/dashboard/performance-metrics';
import { AdvancedTicketTable } from '@/Components/dashboard/advanced-ticket-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, Users, TrendingUp, Activity } from 'lucide-react';
// import { QuickActions } from '@/Components/dashboard/quick-actions';
import { RecentActivity } from '@/Components/dashboard/recent-activity';
import { TicketAnalytics } from '@/Components/dashboard/ticket-analytics';
import { Ticket } from '@/types/ticket';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate ticket statistics
  const ticketStats = React.useMemo(() => {
    const openTickets = posts.filter(p => p.status === 'open').length;
    const inProgressTickets = posts.filter(p => p.status === 'in_progress').length;
    const urgentTickets = posts.filter(p => p.priority === 'urgent').length;
    const highPriorityTickets = posts.filter(p => p.priority === 'high').length;
    const unassignedTickets = posts.filter(p => !p.assignee).length;

    return {
      openTickets,
      inProgressTickets,
      urgentTickets,
      highPriorityTickets,
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
      <Head title={'Support Dashboard'} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Support Dashboard'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Alert Bar for Urgent Issues */}
              {ticketStats.urgentTickets > 0 && (
                <div className="mx-4 lg:mx-6">
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <CardContent className="flex items-center gap-3 p-4">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {ticketStats.urgentTickets} urgent ticket{ticketStats.urgentTickets > 1 ? 's' : ''} require immediate attention
                        </p>
                      </div>
                      <Badge variant="destructive">{ticketStats.urgentTickets}</Badge>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Statistics Cards */}
              {/* <SectionCards
                totalPosts={totalPosts}
                totalUsers={totalUsers}
                automationStats={automation_stats}
                ticketStats={ticketStats}
              /> */}
              {/* <TicketAnalytics
                      posts={posts}
                      automationStats={automation_stats}
              /> */}
              <AdvancedTicketTable
                      posts={posts}
                      refreshKey={refreshKey}
                      onRefresh={() => setRefreshKey(prev => prev + 1)}
              />

              {/* Main Dashboard Content */}
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

