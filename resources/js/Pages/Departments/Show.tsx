import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/Components/Ticket/app-layout';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Toaster } from 'sonner';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Search, Mail, Clock, MessageSquare, ChevronLeft } from 'lucide-react';
import type { Department, Notification } from '@/types';
import useTypedPage from '@/Hooks/useTypedPage';
import PostContent from '@/Components/post-content';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import type { Post } from '@/types/Post';
import { Input } from '@/Components/ui/input';
import { cn, formatTimeAgo } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
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
  const [localNotifications, setLocalNotifications] =
    useState<Notification[]>(initialNotifications);
  const [localPosts, setLocalPosts] = useState<Post[]>(initialPosts);
  const page = useTypedPage();
  const userId = page.props.auth?.user?.id;
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPostView, setShowPostView] = useState(false);
  const user = auth?.user || null;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const selectedPost = useMemo(() => {
    return selectedNotification && selectedNotification.data.post_id
      ? localPosts.find(
          post => post.id === selectedNotification.data.post_id,
        ) || null
      : null;
  }, [selectedNotification, localPosts]);

  const filteredNotifications = useMemo(() => {
    return localNotifications.filter(notification => {
      const matchesSearch =
        searchQuery === '' ||
        notification.data.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.data.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.data.message
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.data.product_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'unread' && !notification.read_at);

      return matchesSearch && matchesFilter;
    });
  }, [localNotifications, searchQuery, activeFilter]);

  useEffect(() => {
    if (!userId) return;

    const postChannel = window.Echo.channel('notifications');
    postChannel.listen('.new-question-created', (e: Notification) => {
      const newNotification = {
        id: e.id,
        type: 'post',
        data: e.data,
        read_at: null,
        created_at: e.created_at,
      };

      setLocalNotifications(prev => {
        if (prev.some(notification => notification.id === newNotification.id)) {
          return prev;
        }
        return [newNotification as Notification, ...prev];
      });
    });

    return () => {
      postChannel.stopListening('.new-question-created');
      window.Echo.leave('notifications');
    };
  }, [userId]);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && !showPostView && localNotifications.length > 0) {
        setSelectedNotification(localNotifications[0]);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [showPostView, localNotifications]);

  useEffect(() => {
    if (
      !isMobile &&
      selectedNotification === null &&
      localNotifications.length > 0
    ) {
      setSelectedNotification(localNotifications[0]);
    }
  }, [isMobile, localNotifications]);

  const handleNotificationSelect = useCallback(
    async (notification: Notification) => {
      if (isMobile) {
        setShowPostView(true);
      }

      const postId = notification.data.post_id;
      let post = localPosts.find(p => p.id === postId);

      if (!post) {
        try {
          const response = await fetch(route('posts.showById', { id: postId }));
          if (!response.ok) throw new Error('Failed to fetch post');
          post = await response.json();

          if (post) {
            setLocalPosts(prev => {
              if (prev.some(p => p.id === post!.id)) return prev;
              return [post!, ...prev];
            });
          }
        } catch (error) {
          console.error('Error fetching post:', error);
          return;
        }
      }

      setSelectedNotification(notification);
    },
    [localPosts, isMobile],
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
            setLocalNotifications(prev =>
              prev.map(n =>
                n.id === notification.id
                  ? { ...n, read_at: new Date().toISOString() }
                  : n,
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
    (content: string, parentId?: number) => {
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
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  return (
    <TooltipProvider>
      <AppLayout
        title={department.name}
        department={department}
        notifications={localNotifications}
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
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-9 w-full bg-muted/40"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)] pr-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground bg-muted/30 rounded-lg p-6">
                  <Mail className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-base font-medium">
                    No notifications found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    New notifications will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map(notification => {
                    const isSelected =
                      selectedNotification?.id === notification.id;
                    const isUnread = !notification.read_at;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationSelect(notification)}
                        className={cn(
                          'relative p-4 cursor-pointer rounded-lg transition-all',
                          'hover:bg-accent/50 dark:hover:bg-accent/30',
                          isSelected
                            ? 'bg-accent/40 dark:bg-accent/20 ring-1 ring-primary/10  border-l-1 border-primary'
                            : 'bg-card dark:bg-card/80',
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/*{isUnread && (*/}
                          {/*  <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />*/}
                          {/*)}*/}

                          <div
                            className={cn(
                              'flex-1 space-y-2',
                              isUnread && 'pl-1.5',
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  From {notification.data.name}
                                </span>
                                {notification.data.product_name && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-normal px-2 py-0.5"
                                  >
                                    {notification.data.product_name}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                              </div>
                            </div>

                            <h2
                              className={cn(
                                'text-base leading-tight',
                                isUnread ? 'font-semibold' : 'font-medium',
                              )}
                            >
                              {notification.data.title}
                            </h2>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.data.message}
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
                <span className="font-medium">Back to Inbox</span>
              </div>
            )}

            {selectedPost ? (
              <ScrollArea className="h-full w-full">
                <div className="p-4 md:p-6 dark:bg-background ">
                  <PostContent
                    key={selectedPost.id}
                    post={selectedPost}
                    comments={selectedPost.comments}
                    onCommentSubmit={handleCommentSubmit}
                    showBorder={false}
                    currentUser={user}
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Mail className="h-16 w-16 mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-medium mb-2">No post selected</h3>
                <p className="text-center max-w-md">
                  Select a notification from the inbox to view its content
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
