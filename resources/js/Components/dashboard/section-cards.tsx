import { TrendingDownIcon, TrendingUpIcon, Settings, Target, AlertTriangle, Clock, CheckCircle, Users, UserCheck, AlertCircle } from 'lucide-react';

import { Badge } from '@/Components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
interface AutomationStats {
  total_rules: number;
  active_rules: number;
  total_matches: number;
  recent_matches: number;
}

interface TicketStats {
  openTickets: number;
  inProgressTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  unassignedTickets: number;
  totalTickets: number;
}

interface Props {
  totalPosts: number;
  totalUsers: number;
  automationStats?: AutomationStats;
  ticketStats?: TicketStats;
}
export function SectionCards({ totalPosts, totalUsers, automationStats, ticketStats }: Props) {
  return (
    <div
      className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-6 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t
         *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6"
    >
      {/* Open Tickets */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Open Tickets</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {ticketStats?.openTickets || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <AlertCircle className="size-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Awaiting response
          </div>
          <div className="text-muted-foreground">
            Requires attention
          </div>
        </CardFooter>
      </Card>

      {/* In Progress Tickets */}
      {/* <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>In Progress</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {ticketStats?.inProgressTickets || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Clock className="size-5 text-yellow-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Being worked on
          </div>
          <div className="text-muted-foreground">
            Active resolution
          </div>
        </CardFooter>
      </Card> */}

      {/* Urgent Tickets */}
      <Card className="@container/card border-red-200 dark:border-red-800">
        <CardHeader className="relative">
          <CardDescription>Urgent Tickets</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-red-600">
            {ticketStats?.urgentTickets || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-red-600">
            Immediate attention
          </div>
          <div className="text-muted-foreground">
            Critical priority
          </div>
        </CardFooter>
      </Card>

      {/* Unassigned Tickets */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Unassigned</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {ticketStats?.unassignedTickets || 0}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <UserCheck className="size-5 text-orange-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Need assignment
          </div>
          <div className="text-muted-foreground">
            Awaiting staff
          </div>
        </CardFooter>
      </Card>
      {/* Total Users */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalUsers}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Users className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active users
          </div>
          <div className="text-muted-foreground">
            System users
          </div>
        </CardFooter>
      </Card>

      {/* Total Tickets */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Tickets</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalPosts}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <CheckCircle className="size-5 text-purple-500" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All time tickets <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Complete history
          </div>
        </CardFooter>
      </Card>

      {/* Automation Stats Cards */}
      {/* {automationStats && (
        <>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Active Automation Rules</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {automationStats.active_rules}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Settings className="size-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {automationStats.total_rules} total rules
              </div>
              <div className="text-muted-foreground">
                Automating ticket processing
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Automation Matches</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {automationStats.recent_matches}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Target className="size-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {automationStats.total_matches} total matches
              </div>
              <div className="text-muted-foreground">
                Last 7 days activity
              </div>
            </CardFooter>
          </Card>
        </>
      )} */}

      {/*<Card className="@container/card">*/}
      {/*    <CardHeader className="relative">*/}
      {/*        <CardDescription>Active Accounts</CardDescription>*/}
      {/*        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">45,678</CardTitle>*/}
      {/*        <div className="absolute right-4 top-4">*/}
      {/*            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">*/}
      {/*                <TrendingUpIcon className="size-3" />*/}
      {/*                +12.5%*/}
      {/*            </Badge>*/}
      {/*        </div>*/}
      {/*    </CardHeader>*/}
      {/*    <CardFooter className="flex-col items-start gap-1 text-sm">*/}
      {/*        <div className="line-clamp-1 flex gap-2 font-medium">*/}
      {/*            Strong user retention <TrendingUpIcon className="size-4" />*/}
      {/*        </div>*/}
      {/*        <div className="text-muted-foreground">Engagement exceed targets</div>*/}
      {/*    </CardFooter>*/}
      {/*</Card>*/}
      {/*<Card className="@container/card">*/}
      {/*    <CardHeader className="relative">*/}
      {/*        <CardDescription>Growth Rate</CardDescription>*/}
      {/*        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">4.5%</CardTitle>*/}
      {/*        <div className="absolute right-4 top-4">*/}
      {/*            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">*/}
      {/*                <TrendingUpIcon className="size-3" />*/}
      {/*                +4.5%*/}
      {/*            </Badge>*/}
      {/*        </div>*/}
      {/*    </CardHeader>*/}
      {/*    <CardFooter className="flex-col items-start gap-1 text-sm">*/}
      {/*        <div className="line-clamp-1 flex gap-2 font-medium">*/}
      {/*            Steady performance <TrendingUpIcon className="size-4" />*/}
      {/*        </div>*/}
      {/*        <div className="text-muted-foreground">Meets growth projections</div>*/}
      {/*    </CardFooter>*/}
      {/*</Card>*/}
    </div>
  );
}
