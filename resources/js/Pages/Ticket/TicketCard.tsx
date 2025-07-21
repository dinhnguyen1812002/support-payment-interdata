import { MessageCircle, User, Clock, Tag, ChevronUp } from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import React from "react";
import { Ticket } from "@/types/ticket";
import { AvatarWithFallback } from "@/Components/ui/avatar-with-fallback";
import { formatDistanceToNow } from "date-fns";



interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const hasUpvoted = ticket.has_upvote || false;

  // Temporary debug - remove after testing
  if (ticket.id === 1 || Math.random() < 0.1) {
    console.log('TicketCard Debug - Ticket data:', {
      id: ticket.id,
      title: ticket.title,
      upvote_count: ticket.upvote_count,
      has_upvote: ticket.has_upvote,
      user: ticket.user,
      tags: ticket.tags,
      comments: ticket.comments,
      created_at: ticket.created_at
    });
  }

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "waiting-response":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement upvote functionality
    console.log('Upvote ticket:', ticket.id);
  };

  return (
    <div
      className="flex items-center gap-4 p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      {/* Upvote Section */}
      <div className="flex flex-col items-center gap-1 min-w-[60px]">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 transition-colors ${
            hasUpvoted
              ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
              : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
          }`}
          onClick={handleUpvote}
        >
          <ChevronUp
            className={`h-4 w-4 ${hasUpvoted ? "fill-current" : ""}`}
          />
        </Button>
        <span
          className={`text-xs font-medium ${
            hasUpvoted ? "text-orange-600" : "text-muted-foreground"
          }`}
        >
          {ticket.upvote_count ?? 0}
        </span>
      </div>

      {/* Category Icon */}
      {/* <div className="text-xl min-w-[32px]">
        {getCategoryIcon(ticket.category)}
      </div> */}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
              {ticket.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {ticket.content}
            </p>

            {/* Tags */}
            {ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={tag?.id || index} variant="outline" className="text-xs">
                      {tag?.name || 'Unknown Tag'}
                    </Badge>
                  ))}
                  {ticket.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{ticket.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Author and Meta Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
               <AvatarWithFallback
                  src={ticket.user?.profile_photo_path || undefined}
                  name={ticket.user?.name || 'Unknown User'}
                  alt={ticket.user?.name || 'Unknown User'}
                  className="h-5 w-5"
                />
                <span className="text-muted-foreground">
                  {ticket.user?.name || 'Unknown User'}
                </span>
              </div>

              {ticket.comments && Array.isArray(ticket.comments) && ticket.comments.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{ticket.comments.length}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </span>
              </div>

              {ticket.assignee && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="text-xs">
                    Assigned to {ticket.assignee?.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex flex-col gap-2 min-w-[120px]">
            <Badge
              className={`text-xs justify-center ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {(ticket.priority || 'medium').charAt(0).toUpperCase() +
                (ticket.priority || 'medium').slice(1)}
            </Badge>
            <Badge
              className={`text-xs justify-center ${getStatusColor(
                ticket.status
              )}`}
            >
              {(ticket.status || 'open')
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
