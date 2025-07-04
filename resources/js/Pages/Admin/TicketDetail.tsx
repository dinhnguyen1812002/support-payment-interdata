import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import useTypedPage from '@/Hooks/useTypedPage';

import { Button } from '@/Components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from '@inertiajs/react';
// import { Toast } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { TicketResponseForm } from '@/Components/dashboard/ticket-response-form';
import { SiteHeader } from '@/Components/dashboard/site-header';
import {AppSidebar} from '@/Components/dashboard/app-sidebar';
import { PageTransition } from '@/Components/ui/page-transition';
import { SidebarProvider, SidebarInset } from '@/Components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';
import { StatusUpdateDropdown } from '@/Components/dashboard/status-update-dropdown';
import {
  Calendar,
  User,
  Building,
  Tag as TagIcon,
  FolderOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  created_at: string;
 
  user: {
    id: number;
    name: string;
    email: string;
    profile?: string;
  };
  is_hr_response?: boolean;
}

interface Ticket {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  profile?: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile?: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
    profile_photo_path?: string;
  };
  department?: {
    id: number;
    name: string;
  };
  categories?: Array<{
    id: number;
    title: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
  }>;
  upvote_count?: number;
  comments: Comment[];
}

interface TicketDetailProps {
  ticket: Ticket;
}

export default function TicketDetail({ ticket: initialTicket }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const page = useTypedPage();
  const currentUser = page.props.auth?.user;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setTicket(prevTicket => ({
      ...prevTicket,
      comments: [...prevTicket.comments, newComment]
    }));
  };

  const refreshTicket = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/admin/tickets/${ticket.slug}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        toast.success
      } else {
        throw new Error('Failed to refresh');
      }
    } catch (error) {
      // toast({
      //   toas
      //   description: "Failed to refresh ticket. Please try again.",
      //   variant: "destructive",
      // });
      toast.error("Failed to refresh ticket. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log(ticket);

  return (
     <SidebarProvider>
      <Head title="Tickets" />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="All Tickets" />
        <PageTransition>
            <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
       <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
          
           </Button>
        </Link>
        <h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-white">
          Ticket Detail
        </h2>
       </div>
      <Button
            variant="outline"
            size="sm"
            onClick={refreshTicket}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="py-6">
          <div className="container mx-auto sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Comments Section */}
                <TicketResponseForm
                  ticket={ticket}
                  onCommentAdded={handleCommentAdded}
                  currentUser={currentUser ? {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    profile_photo_path: currentUser.profile_photo_path || undefined
                  } : undefined}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ticket Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <StatusUpdateDropdown
                        ticketId={ticket.id}
                        currentStatus={ticket.status}
                        onStatusUpdated={refreshTicket}
                      />
                    </div>

                    <Separator />

                    {/* Priority */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Priority</span>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(ticket.priority)}
                      >
                        {ticket.priority.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Created Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Created</span>
                      <div className="text-sm text-right">
                        <div>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Updated Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                      <div className="text-sm text-right">
                        <div>{new Date(ticket.updated_at).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(ticket.updated_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* People */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      People
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Reporter */}
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-2">Reporter</span>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ticket.profile || ''} />
                          <AvatarFallback>
                            {ticket.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{ticket.user.name}</div>
                          <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                        </div>
                      </div>
                    </div>

                    {ticket.assignee && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-sm font-medium text-muted-foreground block mb-2">Assigned to</span>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/storage/${ ticket.assignee.profile_photo_path || ''}`} />
                              <AvatarFallback>
                                {ticket.assignee.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{ticket.assignee.name}</div>
                              <div className="text-xs text-muted-foreground">{ticket.assignee.email}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {ticket.department && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Department</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {ticket.department.name}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Categories & Tags */}
                {(ticket.categories?.length || ticket.tags?.length) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Labels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ticket.categories && ticket.categories.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <FolderOpen className="h-4 w-4" />
                            Categories
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ticket.categories.map((category) => (
                              <Badge key={category.id} variant="secondary">
                                {category.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {ticket.tags && ticket.tags.length > 0 && (
                        <>
                          {ticket.categories && ticket.categories.length > 0 && <Separator />}
                          <div>
                            <span className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <TagIcon className="h-4 w-4" />
                              Tags
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {ticket.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
    // <AppLayout
    //   title="Ticket Detail"
    //   renderHeader={() => (
    //     <div className="flex items-center justify-between">
    //       <div className="flex items-center gap-4">
    //         <Link href="/admin">
    //           <Button variant="outline" size="sm">
    //             <ArrowLeft className="h-4 w-4 mr-2" />
    //             Back to Dashboard
    //           </Button>
    //         </Link>
    //         <h2 className="font-semibold text-xl text-gray-800 leading-tight">
    //           Ticket Detail
    //         </h2>
    //       </div>
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         onClick={refreshTicket}
    //         disabled={isRefreshing}
    //       >
    //         <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
    //         Refresh
    //       </Button>
    //     </div>
    //   )} canLogin={false} canRegister={false} notifications={[]}    >
    //   <Head title={`Ticket: ${ticket.title}`} />


    // </AppLayout>
  );
}
