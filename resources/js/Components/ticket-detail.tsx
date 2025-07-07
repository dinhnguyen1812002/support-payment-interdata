import React, { useEffect, useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import { Comment, CommentsResponse } from '@/types/CommentTypes';
import { Category, Tag } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { toast } from '@/Hooks/use-toast';
import { 
  ChevronDown, 
  Globe, 
  Lock, 
  Loader2, 
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
import { route } from 'ziggy-js';

interface TicketDetailProps {
  ticket: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    status?: string;
    priority?: string;
    user: { id: number; name: string; profile_photo_path: string };
    categories: Category[];
    tags: Tag[];
    is_published: boolean;
    upvote_count: number;
    has_upvote: boolean;
    next_page_url: string | null;
    assignee?: {
      id: number;
      name: string;
      profile_photo_path?: string;
    };
    department?: {
      id: number;
      name: string;
    };
  };
  comments: Comment[];
  currentUser: { id: number; name: string; profile_photo_path: string } | null;
  onCommentSubmit: (content: string, parentId?: string) => void;
  showBorder?: boolean;
}

interface NewCommentEvent {
  comment: Comment;
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  comments,
  currentUser,
  onCommentSubmit,
  showBorder = true,
}) => {
  const [commentsResponse, setCommentsResponse] = useState<CommentsResponse>({
    data: comments,
    next_page_url: ticket.next_page_url,
  });

  const authorAvatar = ticket.user.profile_photo_path
    ? `/storage/${ticket.user.profile_photo_path}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        ticket.user.name
      )}&color=7F9CF5&background=EBF4FF`;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    const handleNewComment = (event: CustomEvent<NewCommentEvent>) => {
      setCommentsResponse(prev => ({
        ...prev,
        data: [...prev.data, event.detail.comment],
      }));
    };

    window.addEventListener('newComment', handleNewComment as EventListener);
    return () => {
      window.removeEventListener('newComment', handleNewComment as EventListener);
    };
  }, []);

  return (
    <div
      className={`flex-1 w-full max-w-5xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 ${
        showBorder ? 'lg:border-l' : ''
      } lg:pl-8 xl:pl-12`}
    >
      <div className="mt-5 space-y-4 dark:text-[#F5F5F5]">
        {/* Ticket Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xl font-bold mb-0 me-1 dark:text-[#F5F5F5]">
              {ticket.title}
            </span>
            <div className="flex items-center gap-2">
              {ticket.status && (
                <Badge
                  variant="outline"
                  className={`${getStatusColor(ticket.status)} flex items-center gap-1`}
                >
                  {getStatusIcon(ticket.status)}
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
              {ticket.priority && (
                <Badge
                  variant="outline"
                  className={getPriorityColor(ticket.priority)}
                >
                  {ticket.priority.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Ticket Content */}
          <div className="mb-6 max-w-none prose prose-lg">
            <article
              className="text-lg font-normal dark:text-[#F5F5F5] mb-10 mr-1"
              dangerouslySetInnerHTML={{ __html: ticket.content }}
            ></article>
          </div>
        </div>

        {/* Ticket Metadata */}
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage src={authorAvatar} alt={ticket.user.name} />
              <AvatarFallback className="rounded-md">
                {ticket.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-[#F5F5F5]">
                {ticket.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  try {
                    const date = new Date(ticket.created_at);
                    if (isNaN(date.getTime())) {
                      return 'Invalid date';
                    }
                    return date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  } catch (error) {
                    return 'Invalid date';
                  }
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Ticket Information */}
        {(ticket.assignee || ticket.department) && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            {ticket.assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Assigned to {ticket.assignee.name}</span>
              </div>
            )}
            {ticket.department && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{ticket.department.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Categories and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {ticket.categories.map(category => (
            <Badge
              key={category.id}
              variant="default"
              className="px-3 py-1 text-sm font-medium rounded-lg"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              {category.title}
            </Badge>
          ))}
          {ticket.tags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-3 py-1 text-sm font-medium rounded-lg hover:border-solid"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag.name}
            </Badge>
          ))}
        </div>

        <hr className="w-full border-t border-dashed border-gray-300 mt-8 mb-8" />
        
        {/* Comments Section */}
        <CommentsSection
          initialComments={commentsResponse}
          onCommentSubmit={onCommentSubmit}
          postId={ticket.id}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default TicketDetail;
