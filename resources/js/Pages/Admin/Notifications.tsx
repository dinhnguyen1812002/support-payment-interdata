import React, { useState, useEffect, useCallback } from 'react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Search, MessageSquare, ChevronLeft } from 'lucide-react';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import PostContent from '@/Components/post-content';
import useTypedPage from '@/Hooks/useTypedPage';
import { PageTransition } from '@/Components/ui/page-transition';
import { Page } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path: string;
  all_teams?: Team[];
  current_team?: Team;
}

interface Team {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  categories: Category[];
  tags: Tag[];
  comments: any[];
  upvote_count: number;
  has_upvote: boolean;
  is_published: boolean;
  next_page_url: string | null;
}

interface Notification {
  id: string;
  data: {
    post_id: string;
    title: string;
    content: string;
    slug: string;
    message: string;
    name: string;
    profile_photo_url: string;
    tags: string[];
    categories: string[];
    type_notification: string;
    created_at: string;
  };
  read_at: string | null;
  created_at: string;
}

interface PageProps {
  notifications: Notification[];
  posts: Post[];
  post?: Post;
}

export default function AdminNotifications({
  notifications: initialNotifications,
  posts: initialPosts,
}: PageProps) {
  const { auth } = useTypedPage().props;
  const userId = auth.user?.id;
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications || [],
  );
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostView, setShowPostView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId) return;

    // Listen for new post notifications
    const notificationsChannel = window.Echo.channel('notifications');
    notificationsChannel.listen('.new-question-created', (event: any) => {
      const newNotification = event;

      // Add notification to the list if it doesn't exist
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });

      // Fetch the post details
      router.get(
        route('admin.posts.get', { id: newNotification.data.post_id }),
        {},
        {
          preserveState: true,
          onSuccess: page => {
            // page is of type Page<PageProps>
            const newPost = page.props.post as Post;
            setPosts(prev => {
              if (prev.some(p => p.id === newPost.id)) {
                return prev;
              }
              return [newPost, ...prev];
            });
          },
        },
      );
    });

    return () => {
      notificationsChannel.stopListening('.new-question-created');
    };
  }, [userId]);

  const handlePostSelect = useCallback(
    (postId: string) => {
      setSelectedPostId(postId);
      const post = posts.find(p => p.id === postId);
      setSelectedPost(post || null);
      setShowPostView(true);

      // Mark notification as read
      const notification = notifications.find(n => n.data.post_id === postId);
      if (notification && !notification.read_at) {
        router.post(
          route('notifications.read-all', { id: notification.id }),
          {},
          {
            preserveScroll: true,
            onSuccess: () => {
              setNotifications(prev =>
                prev.map(n =>
                  n.id === notification.id
                    ? { ...n, read_at: new Date().toISOString() }
                    : n,
                ),
              );
            },
          },
        );
      }
    },
    [posts, notifications],
  );

  const handleBackToList = useCallback(() => {
    setShowPostView(false);
  }, []);

  const handleCommentSubmit = useCallback(
    (comment: string) => {
      if (!selectedPost) return;

      router.post(
        route('comments.store'),
        {
          comment,
          post_id: selectedPost.id,
        },
        {
          preserveScroll: true,
          onSuccess: (event: any) => {
            const updatedPost = event.props?.post as Post;
            setPosts(prev =>
              prev.map(p => (p.id === updatedPost.id ? updatedPost : p)),
            );
            setSelectedPost(updatedPost);
          },
        },
      );
    },
    [selectedPost],
  );

  const handleMarkAllAsRead = useCallback(() => {
    router.post(
      route('notifications.read_all'),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setNotifications(prev =>
            prev.map(n => ({ ...n, read_at: new Date().toISOString() })),
          );
        },
      },
    );
  }, []);

  const filteredNotifications = notifications.filter(notification =>
    notification.data.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SidebarProvider>
      <Head title={'Thông báo'} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Notifications'} />
        <PageTransition>
          <div className="flex flex-1 flex-col p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-screen">
              <div className="flex flex-col border rounded-lg overflow-hidden bg-card md:col-span-1">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Post Notifications
                    </h3>
                    <Badge variant="secondary">
                      {notifications.filter(n => !n.read_at).length}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                </div>
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search notifications..."
                      className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-180px)]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-muted-foreground bg-muted/30 p-6">
                      <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
                      <p className="text-base font-medium">
                        No notifications found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        New notifications will appear here in real-time
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredNotifications.map(notification => {
                        const isSelected =
                          selectedPostId === notification.data.post_id;
                        const isRead = !!notification.read_at;

                        return (
                          <div
                            key={notification.id}
                            className={`flex items-start p-3 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-muted'
                                : isRead
                                  ? ''
                                  : 'bg-muted/50'
                            } hover:bg-muted`}
                            onClick={() =>
                              handlePostSelect(notification.data.post_id)
                            }
                          >
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img
                                  src={notification.data.profile_photo_url}
                                  alt={notification.data.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium truncate">
                                  {notification.data.name}
                                </p>
                                <p className="text-xs text-muted-foreground ml-2">
                                  {notification.created_at}
                                </p>
                              </div>
                              <p className="text-sm font-semibold mt-1 truncate">
                                {notification.data.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {notification.data.content}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {notification.data.categories?.map(
                                  (category, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {category}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="flex flex-col border rounded-lg overflow-hidden bg-card md:col-span-2">
                {showPostView && selectedPost ? (
                  <>
                    <div className="p-4 border-b flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToList}
                        className="mr-2"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="text-lg font-semibold truncate">
                        {selectedPost.title}
                      </h3>
                    </div>
                    <ScrollArea className="h-[calc(100vh-180px)]">
                      <div className="p-4 md:p-6">
                        <PostContent
                          key={selectedPost.id}
                          post={{
                            ...selectedPost,
                            is_published: true,
                            next_page_url: null,
                            categories: [],
                            tags: [],
                            upvote_count: 0,
                            has_upvote: false,
                            user: auth.user as User,
                          }}
                          comments={selectedPost.comments}
                          onCommentSubmit={handleCommentSubmit}
                          showBorder={false}
                          currentUser={auth.user as User}
                        />
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-medium mb-2">
                      No post selected
                    </h3>
                    <p className="text-center max-w-md">
                      Select a notification to view the post content
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
