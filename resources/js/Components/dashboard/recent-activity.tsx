import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import { Button } from '@/Components/ui/button';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { route } from 'ziggy-js';
import { getPriorityColor, getStatusColor } from '@/Utils/utils';

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  priority: string;
  created_at: string;

  user: {
    name: string;
    email: string;
    profile_photo_path: string | null;
  };
  assignee?: {
    name: string;
    email: string;
    profile_photo_path: string | null;
  };
  comment?: number;
}

interface RecentActivityProps {
  posts: Post[];
}

export function RecentActivity({ posts }: RecentActivityProps) {
  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'urgent':
  //       return 'bg-red-100 text-red-800 border-red-200';
  //     case 'high':
  //       return 'bg-orange-100 text-orange-800 border-orange-200';
  //     case 'medium':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'low':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'open':
  //       return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'in_progress':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'resolved':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     case 'closed':
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest ticket updates and submissions
            </CardDescription>
          </div>
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <AvatarWithFallback
                src={post.user.profile_photo_path ? `/storage/${post.user.profile_photo_path}` : null}
                name={post.user.name}
                alt={post.user.name}
                className="h-8 w-8"
                variant="identicon"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={route('posts.show', post.slug)}
                      className="font-medium text-sm hover:underline line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {post.user.name}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <div className="flex gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(post.priority)}`}
                      >
                        {formatPriority(post.priority)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(post.status)}`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(post.status)}
                          {formatStatus(post.status)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {/* {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} */}
                    {post.created_at}
                  </div>
                  
                  {post.assignee && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Assigned to {post.assignee.name}</span>
                    </div>
                  )}
                  
                  {post.comment && post.comment > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.comment} comments</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
