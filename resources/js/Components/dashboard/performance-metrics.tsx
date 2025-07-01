import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Progress } from '@/Components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Post {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
    profile_photo_path: string | null;
  };
}

interface TicketStats {
  openTickets: number;
  inProgressTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  unassignedTickets: number;
  totalTickets: number;
}

interface PerformanceMetricsProps {
  posts: Post[];
  ticketStats: TicketStats;
}

export function PerformanceMetrics({ posts, ticketStats }: PerformanceMetricsProps) {
  // Calculate staff performance metrics
  const staffMetrics = useMemo(() => {
    const staffData = posts.reduce((acc, post) => {
      if (post.assignee) {
        const staffId = post.assignee.id;
        if (!acc[staffId]) {
          acc[staffId] = {
            id: staffId,
            name: post.assignee.name,
            email: post.assignee.email,
            profile_photo_path: post.assignee.profile_photo_path,
            totalTickets: 0,
            resolvedTickets: 0,
            urgentTickets: 0,
            avgResponseTime: 0, // Mock data
            satisfactionScore: 0 // Mock data
          };
        }
        acc[staffId].totalTickets++;
        if (post.status === 'resolved' || post.status === 'closed') {
          acc[staffId].resolvedTickets++;
        }
        if (post.priority === 'urgent') {
          acc[staffId].urgentTickets++;
        }
      }
      return acc;
    }, {} as Record<number, any>);

    // Add mock performance data and calculate metrics
    return Object.values(staffData).map((staff: any) => ({
      ...staff,
      resolutionRate: staff.totalTickets > 0 ? (staff.resolvedTickets / staff.totalTickets * 100) : 0,
      avgResponseTime: Math.random() * 4 + 1, // Mock: 1-5 hours
      satisfactionScore: Math.random() * 2 + 3, // Mock: 3-5 stars
      efficiency: staff.totalTickets > 0 ? Math.min(100, (staff.resolvedTickets / staff.totalTickets * 100) + Math.random() * 20) : 0
    })).sort((a, b) => b.efficiency - a.efficiency);
  }, [posts]);

  // Calculate team performance trends (mock data for demonstration)
  const performanceTrends = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        responseTime: Math.random() * 2 + 2, // 2-4 hours
        resolutionRate: Math.random() * 20 + 70, // 70-90%
        satisfaction: Math.random() * 1 + 4 // 4-5 stars
      };
    }).reverse();
    return last7Days;
  }, []);

  // Calculate SLA metrics
  const slaMetrics = useMemo(() => {
    const urgentSLA = 2; // 2 hours for urgent tickets
    const highSLA = 8; // 8 hours for high priority
    const normalSLA = 24; // 24 hours for normal priority

    const urgentTickets = posts.filter(p => p.priority === 'urgent');
    const highTickets = posts.filter(p => p.priority === 'high');
    const normalTickets = posts.filter(p => p.priority === 'medium' || p.priority === 'low');

    return {
      urgent: {
        total: urgentTickets.length,
        withinSLA: Math.floor(urgentTickets.length * 0.85), // Mock 85% compliance
        slaTarget: urgentSLA
      },
      high: {
        total: highTickets.length,
        withinSLA: Math.floor(highTickets.length * 0.92), // Mock 92% compliance
        slaTarget: highSLA
      },
      normal: {
        total: normalTickets.length,
        withinSLA: Math.floor(normalTickets.length * 0.96), // Mock 96% compliance
        slaTarget: normalSLA
      }
    };
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* SLA Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent SLA</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slaMetrics.urgent.total > 0 ? 
                ((slaMetrics.urgent.withinSLA / slaMetrics.urgent.total) * 100).toFixed(1) : '0'}%
            </div>
            <Progress 
              value={slaMetrics.urgent.total > 0 ? (slaMetrics.urgent.withinSLA / slaMetrics.urgent.total) * 100 : 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {slaMetrics.urgent.withinSLA} of {slaMetrics.urgent.total} within {slaMetrics.urgent.slaTarget}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority SLA</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slaMetrics.high.total > 0 ? 
                ((slaMetrics.high.withinSLA / slaMetrics.high.total) * 100).toFixed(1) : '0'}%
            </div>
            <Progress 
              value={slaMetrics.high.total > 0 ? (slaMetrics.high.withinSLA / slaMetrics.high.total) * 100 : 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {slaMetrics.high.withinSLA} of {slaMetrics.high.total} within {slaMetrics.high.slaTarget}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal SLA</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slaMetrics.normal.total > 0 ? 
                ((slaMetrics.normal.withinSLA / slaMetrics.normal.total) * 100).toFixed(1) : '0'}%
            </div>
            <Progress 
              value={slaMetrics.normal.total > 0 ? (slaMetrics.normal.withinSLA / slaMetrics.normal.total) * 100 : 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {slaMetrics.normal.withinSLA} of {slaMetrics.normal.total} within {slaMetrics.normal.slaTarget}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Key performance indicators over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3b82f6" 
                name="Avg Response Time (hours)"
              />
              <Line 
                type="monotone" 
                dataKey="resolutionRate" 
                stroke="#10b981" 
                name="Resolution Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Performance
          </CardTitle>
          <CardDescription>
            Individual performance metrics and rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffMetrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No staff performance data available</p>
              </div>
            ) : (
              staffMetrics.slice(0, 5).map((staff, index) => (
                <div key={staff.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={staff.profile_photo_path || ''} />
                      <AvatarFallback>
                        {staff.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium">{staff.totalTickets}</p>
                      <p className="text-xs text-muted-foreground">Total Tickets</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{staff.resolutionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Resolution Rate</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{staff.avgResponseTime.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <p className="text-sm font-medium">{staff.satisfactionScore.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <Award className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
