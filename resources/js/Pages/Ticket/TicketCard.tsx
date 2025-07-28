import { MessageCircle, User, Clock, Tag } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import React, { useState, useEffect } from 'react';
import { Ticket } from '@/types/ticket';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import { UpvoteButton } from '@/Components/UpvoteButton';
import { CategoryDisplay } from '@/Components/CategoryFilter';
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from '@radix-ui/react-tooltip';
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from '@/Utils/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // const getPriorityColor = (priority: string | undefined) => {
  //   switch (priority) {
  //     case 'low':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     case 'medium':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'high':
  //       return 'bg-orange-100 text-orange-800 border-orange-200';
  //     case 'urgent':
  //       return 'bg-red-100 text-red-800 border-red-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };



  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      {/* Mobile: Status and Priority Badges at top */}
      <div className="flex sm:hidden items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <Badge
            className={`text-xs pointer-events-none ${getPriorityColor(ticket.priority)}`}
          >
            {getPriorityLabel(ticket.priority)}
          </Badge>
          <Badge
            className={`text-xs pointer-events-none ${getStatusColor(ticket.status)}`}
          >
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>
        
        {/* Mobile Upvote */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <UpvoteButton
                  post_id={ticket.id}
                  initialUpvoteCount={ticket.upvote_count || 0}
                  initialHasUpvoted={ticket.has_upvote || false}
                  size="sm"
                  variant="card"
                  className="min-w-[50px]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{ticket.has_upvote ? 'Bỏ thích' : 'Thích bài viết này'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Desktop Upvote Section */}
      <div className="hidden sm:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <UpvoteButton
                  post_id={ticket.id}
                  initialUpvoteCount={ticket.upvote_count || 0}
                  initialHasUpvoted={ticket.has_upvote || false}
                  size="sm"
                  variant="card"
                  className="min-w-[60px]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{ticket.has_upvote ? 'Bỏ thích' : 'Thích bài viết này'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base leading-tight mb-1 group-hover:text-primary transition-colors">
              {ticket.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1 mb-2">
              {ticket.content}
            </p>
            
            {/* Tags and Categories - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-2 sm:gap-4 mb-2">
              {/* Tags */}
              {ticket.tags &&
                Array.isArray(ticket.tags) &&
                ticket.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {ticket.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
                        <Badge
                          key={tag?.id || index}
                          variant="outline"
                          className="text-xs pointer-events-none"
                        >
                          {tag?.name || 'Thẻ không xác định'}
                        </Badge>
                      ))}

                      {/* Show more tags if > limit */}
                      {ticket.tags.length > (isMobile ? 2 : 3) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer"
                              >
                                +{ticket.tags.length - (isMobile ? 2 : 3)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {ticket.tags.slice(isMobile ? 2 : 3).map((tag, idx) => (
                                <div key={tag?.id || idx} className="text-xs">
                                  {tag?.name || 'Không xác định'}
                                </div>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                )}

              {/* Categories */}
              {ticket.categories && ticket.categories.length > 0 && (
                <CategoryDisplay
                  categories={ticket.categories}
                  maxDisplay={isMobile ? 1 : 2}
                  size="xs"
                />
              )}
            </div>

            {/* Author and Meta Info - Responsive layout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AvatarWithFallback
                  src={ticket.user?.profile_photo_path}
                  name={ticket.user?.name || 'Người dùng không xác định'}
                  alt={ticket.user?.name || 'Người dùng không xác định'}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  variant="geometric"
                />
                <span className="text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                  {ticket.user?.name || 'Người dùng không xác định'}
                </span>
              </div>

              {(ticket.comments_count ?? 0) >= 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{ticket.comments_count}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs">{ticket.created_at}</span>
              </div>

              {ticket.assignee && (
                <div className="flex items-center gap-1 text-muted-foreground  sm:flex">
                  <User className="w-3 h-3" />
                  <span className="text-xs">
                    Được giao cho {ticket.assignee?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile: Show assignee on separate line */}
            {ticket.assignee && (
              <div className="flex sm:hidden items-center gap-1 text-muted-foreground mt-1">
                <User className="w-3 h-3" />
                <span className="text-xs">
                  Được giao cho {ticket.assignee?.name}
                </span>
              </div>
            )}
          </div>

          {/* Desktop: Status and Priority Badges */}
          <div className="hidden sm:flex flex-col gap-2 min-w-[120px]">
            <Badge
              className={`text-xs justify-center pointer-events-none ${getPriorityColor(
                ticket.priority,
              )}`}
            >
              {getPriorityLabel(ticket.priority)}
            </Badge>
            <Badge
              className={`text-xs justify-center pointer-events-none ${getStatusColor(
                ticket.status,
              )}`}
            >
              {getStatusLabel(ticket.status)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
