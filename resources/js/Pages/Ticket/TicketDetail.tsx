import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Clock,
  Tag,
  ChevronUp,
  Send,
  Settings,
  ArrowBigUp,
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


export interface User {
  id: number;
  name: string;
  profile_photo_path: string | null;
  roles?: string[];
  departments?: string[];
}


interface TicketDetailPageProps {
  ticket: Ticket;
  categories?: Category[];
  departments?: Department[];
  users?: User[];
  auth: { user: { id: number; name: string; profile_photo_path: string } };
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
  // Check if current user has upvoted this ticket
  const hasUpvoted = ticket.has_upvote || false;

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
  console.log('Current user:', currentUser);
  console.log('Ticket comments:', ticket.comments);
  console.log('Comment user:', commentUser);
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

  const handleUpvote = () => {
    // TODO: Implement upvote functionality with Inertia
    console.log('Upvote ticket:', ticket.id);
  };

  const handleCommentSubmit = (content: string, parentId?: string) => {
    setIsSubmitting(true);

    console.log('Submitting comment:', {
      comment: content,
      post_id: ticket.id,
      parent_id: parentId || null,
    });

    router.post(
      route('comments.store'),
      {
        comment: content,
        post_id: ticket.id,
        parent_id: parentId || null,
      },
      {
        onSuccess: (response) => {
          console.log('Comment submitted successfully:', response);
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
      backLabel="Back to tickets"
    >
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Content */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-10 w-10 p-0 transition-colors ${
                        hasUpvoted
                          ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                          : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      onClick={handleUpvote}
                    >
                      <ChevronUp
                        className={`h-5 w-5 ${hasUpvoted ? 'fill-current' : ''}`}
                      />
                    </Button>
                    <div className="text-center">
                      <div
                        className={`text-sm font-semibold ${
                          hasUpvoted
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {ticket.upvote_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(ticket.upvote_count || 0) === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                  </div>

                  {/* <span className="text-2xl">{getCategoryIcon(ticket.category)}</span> */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-tight mb-2">
                      {ticket.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>#{ticket.id}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Created {ticket.created_at}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{ticket.comments?.data?.length || 0} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowBigUp className="w-5 h-8" />
                        <span>{ticket.upvote_count || 0} upvotes</span>
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
              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Description</h3>
                  <div className="p-4 bg-muted/30 border rounded-lg">
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: ticket.content }}
                    ></p>
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Category</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {ticket.categories && ticket.categories.length > 0
                        ? ticket.categories[0].title
                        : 'No category'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Author</div>
                    <div className="flex items-center gap-2">
                      <AvatarWithFallback
                        src={ticket.user?.profile_photo_path}
                        name={ticket.user?.name || 'Unknown'}
                        className="w-5 h-5"
                      />
                      <span className="text-sm text-muted-foreground">
                        {ticket.user?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  {ticket.assignee && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Assigned to</div>
                      <div className="flex items-center gap-2">
                        <AvatarWithFallback
                          src={ticket.assignee.profile_photo_path}
                          name={ticket.assignee.name}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-muted-foreground">
                          {ticket.assignee.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {ticket.department && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Department</div>
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
                      Tags
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

                {/* Comments */}
                {/* {ticket.comments && ticket.comments.data && ticket.comments.data.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4" />
                      Comments ({ticket.comments.data.length})
                    </h3>
                    <div className="space-y-4">
                      {ticket.comments.data.map(comment => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <AvatarWithFallback
                                src={comment.user?.profile_photo_path}
                                name={comment.user?.name || 'Unknown'}
                                className="w-8 h-8"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {comment.user?.name || 'Unknown'}
                                  </span>
                                  {comment.is_hr_response && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      HR Staff
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(comment.created_at),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                {/* Comment Form */}
                <Separator />
                {/* <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Add a comment
                  </h3>
                  {currentUser ? (
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <AvatarWithFallback
                          src={currentUser.profile_photo_url}
                          name={currentUser.name}
                          className="w-8 h-8 mt-1"
                        />
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Write your comment here..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="min-h-[100px] resize-none"
                            disabled={isSubmitting}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                Commenting as{' '}
                                <span className="font-medium">
                                  {currentUser.name}
                                </span>
                              </span>
                              {isAdmin && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-50 text-red-700 border-red-200"
                                >
                                  Admin
                                </Badge>
                              )}
                              {isStaff && !isAdmin && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  Staff
                                </Badge>
                              )}
                            </div>
                            <Button
                              type="submit"
                              disabled={!comment.trim() || isSubmitting}
                              className="gap-2"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  Post Comment
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Please log in to post a comment.
                      </p>
                    </div>
                  )}
                </div> */}
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
