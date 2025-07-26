import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Clock,
  Tag,
  Send,
  Settings,
  ArrowBigUp,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { Card } from '@/Components/ui/card';
import { Ticket, Comment as TicketComment } from '@/types/ticket';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import TicketLayout from '@/Layouts/TicketLayout';
import useTypedPage from '@/Hooks/useTypedPage';
import { ScrollArea } from '@/Components/ui/scroll-area';
import CommentForm from '../Comments/CommentForm';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import CommentsSection from '../Comments/CommentsSection';
import { Category, Department } from '@/types';
import { Notification } from '@/types/Notification';
import { CommentsResponse } from '@/types/CommentTypes';
import { UpvoteButton } from '@/Components/UpvoteButton';


export interface User {
  id: number;
  name: string;
  profile_photo_path: string | null;
  profile_photo_url?: string | null;
  roles?: string[];
  departments?: string[];
}


interface TicketDetailPageProps {
  ticket: Ticket;
  categories?: Category[];
  departments?: Department[];
  users?: User[];
  auth: { user: { id: number; name: string; profile_photo_path: string; profile_photo_url?: string } };
  notifications?: Notification[];
  filters?: {
    status?: string;
    priority?: string;
    department?: string;
    assignee?: string;
    category?: string;
    search?: string;
    myTickets?: boolean;
    sortBy?: string;
  };

  comments?: Comment[];
}

export default function TicketDetail({
  ticket,
  categories = [],
  departments = [],
  users = [],
  auth,
  notifications = [],
  filters = {},
}: TicketDetailPageProps) {
  const page = useTypedPage();
  const currentUser = page.props.auth?.user;
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.user || null;

  // Convert user to match CommentsSection expected type
  const commentUser = user ? {
    id: user.id,
    name: user.name,
    profile_photo_path: user.profile_photo_path,
    roles: currentUser?.roles?.map(role => role.name) || [],
    departments: currentUser?.departments?.map(dept => dept.name) || []
  } : null;
  // Check if current user has upvoted this ticket (initial state)
  const initialHasUpvoted = ticket.has_upvote || false;

  // Helper function to check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.some(role => role.name === roleName);
  };

  // Check if current user is admin or staff
  const isAdmin = hasRole('admin');
  const isStaff = hasRole('staff') || hasRole('department_manager');
  const canManageTicket = isAdmin || isStaff;
  const [body, setBody] = useState('');
  // Debug: Log user roles and comments (remove in production)
  // console.log('Current user:', currentUser);
  // console.log('Ticket comments:', ticket.comments);
  // console.log('Comment user:', commentUser);
  // console.log('User roles:', currentUser?.roles);
  // console.log('Is admin:', isAdmin);
  // console.log('Is staff:', isStaff);
  // console.log('Can manage ticket:', canManageTicket);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiting-response':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  
  const handleCommentSubmit = (content: string, parentId?: string) => {
    setIsSubmitting(true);

    router.post(
      route('comments.store'),
      {
        comment: content,
        post_id: ticket.id,
        parent_id: parentId || null,
      },
      {
        onSuccess: () => {
          setBody('');
          setIsSubmitting(false);
        },
        preserveScroll: true,
        onError: errors => {
          console.error('Error submitting comment:', errors);
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <TicketLayout
      title={`Ticket #${ticket.id} - ${ticket.title}`}
      categories={categories}
      departments={departments}
      users={users}
      filters={filters}
      notifications={notifications}
      backUrl="/tickets"
      backLabel="Quay lại danh sách yêu cầu"
      showTabs={false}
      showLable = {false}
      showCreateButton={false}
    >
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.get('/tickets')}
            >
              <ArrowLeft className="h-4 w-4" />
             
            </Button>
            {/* Content */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Upvote Section */}
                  <UpvoteButton
                    post_id={ticket.id}
                    initialUpvoteCount={ticket.upvote_count || 0}
                    initialHasUpvoted={initialHasUpvoted}
                    size="md"
                    variant="detail"
                    className="pt-1"
                  />

                  {/* <span className="text-2xl">{getCategoryIcon(ticket.category)}</span> */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-tight mb-2">
                      {ticket.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>#{ticket.id}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Tạo lúc {ticket.created_at}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{ticket.comments?.data?.length || 0} phản hồi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowBigUp className="w-5 h-8" />
                        <span>{ticket.upvote_count || 0} lượt thích</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge
                    className={`text-xs ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority.charAt(0).toUpperCase() +
                      ticket.priority.slice(1)}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </Badge>
                </div>
              </div>
              <div className="space-y-7 mt-5">
                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Mô tả</h3>
                  <div className="p-4 bg-muted/30 border rounded-lg">
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: ticket.content }}
                    ></p>
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Danh mục</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {ticket.categories && ticket.categories.length > 0
                        ? ticket.categories[0].title
                        : 'Không có danh mục'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Người dùng</div>
                    <div className="flex items-center gap-2">
                      <AvatarWithFallback
                        src={ticket.user?.profile_photo_url}
                        name={ticket.user?.name}
                        className="w-8 h-8"
                      />
                      <span className="text-sm text-muted-foreground">
                        {ticket.user?.name}
                      </span>
                    </div>
                  </div>
                  {ticket.assignee && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Được giao cho</div>
                      <div className="flex items-center gap-2">
                        <AvatarWithFallback
                          src={ticket.assignee.profile_photo_url}
                          name={ticket.assignee.name}
                          className="w-8 h-8"
                        />

                        <span className="text-sm text-muted-foreground">
                          {ticket.assignee.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {ticket.department && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Phòng ban</div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.department.name}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Actions - Only show for staff/admin */}
                {/* {canManageTicket && (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Ticket Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2  ">
                          <label className="text-sm font-medium dark:text-black">Status</label>
                          <select
                            className="w-full p-2 border rounded-md text-sm dark:text-white text-black"
                            value={ticket.status}
                            onChange={e => {
                              // TODO: Implement status update
                              console.log('Update status to:', e.target.value);
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="waiting-response">
                              Waiting Response
                            </option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium dark:text-black">
                            Priority
                          </label>
                          <select
                            className="w-full p-2 border rounded-md text-sm dark:text-white text-black"
                            value={ticket.priority}
                            onChange={e => {
                              // TODO: Implement priority update
                              console.log(
                                'Update priority to:',
                                e.target.value,
                              );
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium dark:text-black">
                            Assign To
                          </label>
                          <select
                            className="w-full p-2 border rounded-md text-sm dark:text-white text-black"
                            value={ticket.assignee?.id || ''}
                            onChange={e => {
                              // TODO: Implement assignee update
                              console.log('Assign to user:', e.target.value);
                            }}
                          >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )} */}

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Thẻ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment Form */}
                <Separator />

                <CommentsSection
                  initialComments={ticket.comments}
                  onCommentSubmit={handleCommentSubmit}
                  postId={ticket.id}
                  currentUser={commentUser}
                />
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </TicketLayout>
  );
}
