import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  UserPlus, 
  Settings, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface TicketStats {
  openTickets: number;
  inProgressTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  unassignedTickets: number;
  totalTickets: number;
}

interface QuickActionsProps {
  ticketStats: TicketStats;
}

export function QuickActions({ ticketStats }: QuickActionsProps) {
  const quickActionItems = [
    {
      title: 'Create New Ticket',
      description: 'Add a new support ticket',
      icon: Plus,
      href: '/admin/tickets/create',
      variant: 'default' as const,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Assign Tickets',
      description: `${ticketStats.unassignedTickets} unassigned`,
      icon: UserPlus,
      href: '/admin/tickets?filter=unassigned',
      variant: 'outline' as const,
      badge: ticketStats.unassignedTickets > 0 ? ticketStats.unassignedTickets : null,
      color: 'text-orange-600'
    },
    {
      title: 'Urgent Tickets',
      description: 'Review critical issues',
      icon: AlertTriangle,
      href: '/admin/tickets?priority=urgent',
      variant: ticketStats.urgentTickets > 0 ? 'destructive' as const : 'outline' as const,
      badge: ticketStats.urgentTickets > 0 ? ticketStats.urgentTickets : null,
      color: 'text-red-600'
    },
    {
      title: 'In Progress',
      description: 'Monitor active tickets',
      icon: Clock,
      href: '/admin/tickets?status=in_progress',
      variant: 'outline' as const,
      badge: ticketStats.inProgressTickets > 0 ? ticketStats.inProgressTickets : null,
      color: 'text-yellow-600'
    },
    {
      title: 'User Management',
      description: 'Manage staff and roles',
      icon: Users,
      href: '/admin/users',
      variant: 'outline' as const,
      color: 'text-green-600'
    },
    {
      title: 'Automation Rules',
      description: 'Configure auto-assignment',
      icon: Settings,
      href: '/admin/automation-rules',
      variant: 'outline' as const,
      color: 'text-purple-600'
    }
  ];

  const filterActions = [
    {
      title: 'All Open Tickets',
      count: ticketStats.openTickets,
      href: '/admin/tickets?status=open',
      color: 'text-blue-600'
    },
    {
      title: 'High Priority',
      count: ticketStats.highPriorityTickets,
      href: '/admin/tickets?priority=high',
      color: 'text-orange-600'
    },
    {
      title: 'Unassigned',
      count: ticketStats.unassignedTickets,
      href: '/admin/tickets?filter=unassigned',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActionItems.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="block"
            >
              <Button
                variant={action.variant}
                className={`w-full justify-start h-auto p-3 ${action.color}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-70">{action.description}</div>
                    </div>
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Quick Filters
          </CardTitle>
          <CardDescription>
            Jump to filtered views
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filterActions.map((filter, index) => (
            <Link
              key={index}
              href={filter.href}
              className="block"
            >
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className={`text-sm font-medium ${filter.color}`}>
                  {filter.title}
                </span>
                <Badge variant="outline">
                  {filter.count}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
