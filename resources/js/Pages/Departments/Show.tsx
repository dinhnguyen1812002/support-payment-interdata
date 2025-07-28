import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/Components/Ticket/app-layout';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Toaster } from 'sonner';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Search, Mail, Clock, MessageSquare, ChevronLeft, AlertTriangle, CheckCircle, XCircle, User, Building, Tag as TagIcon, FolderOpen } from 'lucide-react';
import type { Department, Notification } from '@/types';
import useTypedPage from '@/Hooks/useTypedPage';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import type { Post } from '@/types/Post';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import TicketDetail from '@/Components/ticket-detail';
import PostContent from '@/Components/post-content';

interface Props {
  notifications: Notification[];
  department: Department;
  posts: Post[];
  auth: { user: { id: number; name: string; profile_photo_path: string } };
}

export default function DepartmentShow({
  department,
  notifications: initialNotifications = [],
  posts: initialPosts = [],
  auth,
}: Props) {
  // Filter only new post notifications from initial data
  const [localPosts, setLocalPosts] = useState<Post[]>(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const page = useTypedPage();
  const userId = page.props.auth?.user?.id;
  const [isMobile, setIsMobile] = useState(false);
  const [showPostView, setShowPostView] = useState(false);
  const user = auth?.user || null;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const selectedPost = useMemo(() => {
    return selectedPostId
      ? localPosts.find(post => post.id === selectedPostId) || null
      : null;
  }, [selectedPostId, localPosts]);

  const filteredPosts = useMemo(() => {
    return localPosts
      .filter(post => {
      const matchesSearch =
        searchQuery === '' ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.product_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [localPosts, searchQuery]);

  useEffect(() => {
    if (!userId || !department?.id) return;

    // Kênh cho department posts
    const departmentChannel = window.Echo.channel(
      `department.${department.id}`,
    );
    departmentChannel.listen('.new-post-created', (e: any) => {
      const newPost = e.post;

      if (!newPost) return;

      // Thêm post mới vào danh sách
      setLocalPosts(prev => {
        if (prev.some(post => post.id === newPost.id)) {
          return prev;
        }
        return [newPost, ...prev];
      });
    });

    return () => {
      departmentChannel.stopListening('.new-post-created');
      window.Echo.leave(`department.${department.id}`);
    };
  }, [userId, department?.id]);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && !showPostView && localPosts.length > 0) {
        setSelectedPostId(localPosts[0].id);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [showPostView, localPosts]);

  useEffect(() => {
    if (!isMobile && selectedPostId === null && localPosts.length > 0) {
      setSelectedPostId(localPosts[0].id);
    }
  }, [isMobile, localPosts]);

  const handlePostSelect = useCallback(
    async (post: Post) => {
      if (isMobile) {
        setShowPostView(true);
      }
      setSelectedPostId(post.id);
    },
    [isMobile],
  );

  const handleMarkAsRead = useCallback(
    (notification: Notification, e: React.MouseEvent) => {
      e.stopPropagation();

      if (notification.read_at) {
        return;
      }

      router.post(
        route('notifications.read_all', { id: notification.id }),
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            setLocalPosts(prev =>
              prev.map(p =>
                p.id === notification.data.post_id
                  ? { ...p, read_at: new Date().toISOString() }
                  : p,
              ),
            );
          },
        },
      );
    },
    [],
  );

  const handleBackToList = useCallback(() => {
    setShowPostView(false);
  }, []);

  const handleCommentSubmit = useCallback(
    (content: string, parentId?: string) => {
      if (!selectedPost) return;

      router.post(
        route('comments.store'),
        {
          comment: content,
          post_id: selectedPost.id,
          parent_id: parentId || null,
        },
        {
          preserveScroll: true,
          onError: errors => {
            console.error('Error submitting comment:', errors);
          },
        },
      );
    },
    [selectedPost],
  );

  // const formatTimeAgo = (dateString: string) => {
  //   try {
  //     if (!dateString) return 'Invalid date';
  //     const date = new Date(dateString);
  //     if (isNaN(date.getTime())) return 'Invalid date';
  //     return formatDistanceToNow(date, { addSuffix: true });
  //   } catch (error) {
  //     return 'Invalid date';
  //   }
  // };

  // // Helper functions for status and priority styling
  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
  //     case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'open': return <AlertTriangle className="h-3 w-3" />;
  //     case 'in_progress': return <Clock className="h-3 w-3" />;
  //     case 'resolved': return <CheckCircle className="h-3 w-3" />;
  //     case 'closed': return <XCircle className="h-3 w-3" />;
  //     default: return <AlertTriangle className="h-3 w-3" />;
  //   }
  // };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
  //     case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
  //     case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'low': return 'bg-green-100 text-green-800 border-green-200';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };
console.log(localPosts);
  return (
    <TooltipProvider>
      <AppLayout
        title={department.name}
        department={department}
        notifications={initialNotifications}
        post={localPosts}
      >
        <div className="flex overflow-hidden h-[calc(100vh-4rem)] relative">
          <div
            className={cn(
              'flex-col border-r dark:border-gray-800 bg-background',
              'w-full md:w-96 lg:w-[400px] h-full',
              isMobile && showPostView ? 'hidden' : 'flex',
            )}
          >
            <div className="p-4 border-b dark:border-gray-800 bg-background flex flex-col gap-3 ">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Department Tickets</h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredPosts.length}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 w-full bg-muted/40"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)] pr-3">
              {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground bg-muted/30 rounded-lg p-6">
                  <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-base font-medium">No tickets found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Department tickets will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPosts.map(post => {
                    const isSelected = selectedPostId === post.id;

                    return (
                      <div
                        key={post.id}
                        onClick={() => handlePostSelect(post)}
                        className={cn(
                          'relative p-4 cursor-pointer rounded-lg transition-all',
                          'hover:bg-accent/50 dark:hover:bg-accent/30',
                          isSelected
                            ? 'bg-accent/40 dark:bg-accent/20 ring-1 ring-primary/10 border-l-2 border-primary'
                            : 'bg-card dark:bg-card/80',
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Ticket by {post.user?.name}
                                </span>
                                {/* {post.status && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-normal px-2 py-0.5 ${getStatusColor(post.status)}`}
                                  >
                                    {post.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                )} */}
                                {/* {post.priority && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-normal px-2 py-0.5 ${getPriorityColor(post.priority)}`}
                                  >
                                    {post.priority.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                )} */}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {/* <span>{formatTimeAgo(post.created_at)}</span> */}
                                <span>{post.created_at}</span>
                              </div>
                            </div>

                            <h2 className="text-base leading-tight font-medium">
                              {post.title}
                            </h2>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {post.assignee && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>Assigned to {post.assignee.name}</span>
                                </div>
                              )}
                              {post.product_name && (
                                <div className="flex items-center gap-1">
                                  <TagIcon className="h-3 w-3" />
                                  <span>{post.product_name}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content
                                ? post.content.replace(/<[^>]*>/g, '')
                                : 'No content'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div
            className={cn(
              'flex-1 h-full overflow-hidden',
              isMobile && !showPostView ? 'hidden' : 'block',
            )}
          >
            {isMobile && showPostView && (
              <div className="p-4 border-b dark:border-gray-800 flex items-center bg-background sticky top-0 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="mr-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="font-medium">Back to Tickets</span>
              </div>
            )}

            {selectedPost ? (
              // <ScrollArea className="h-[calc(100vh-100px)]">  
              //   <PostContent
              //     post={selectedPost}
              //     currentUser={auth.user}
              //     onCommentSubmit={handleCommentSubmit}
              //     showBorder={false}
              //   />
              // </ScrollArea>
              <div>content </div>
              
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-40" />
                <p className="text-lg font-medium">Select a ticket to view details</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a ticket from the list to see its details and comments
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
      <Toaster />
    </TooltipProvider>
  );
}


      