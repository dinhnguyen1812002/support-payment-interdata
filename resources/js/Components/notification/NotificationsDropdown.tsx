import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Bell, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertInfoDemo from '@/Components/InfoAlert';
import useTypedPage from '@/Hooks/useTypedPage';
import { Category } from '@/types';
import { createApiClient } from '@/Utils/utils';

// Constants
const CONSTANTS = {
  MAX_NOTIFICATIONS: 10,
  ALERT_TIMEOUT: 5000,
  ERROR_TIMEOUT: 3000,
  FETCH_DEBOUNCE_MS: 500,
  MAX_RETRY_ATTEMPTS: 3,
} as const;

const TAB_KEYS = {
  ALL: 'all',
  UNREAD: 'unread',
  POST: 'post',
  COMMENT: 'comment',
} as const;

// Types
interface NotificationData {
  post_id: string;
  title?: string;
  message: string;
  slug?: string;
  name?: string;
  profile_photo_url?: string;
  categories?: Category[];
  type_notification?: string;
  comment_id?: string;
}

interface Notification {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  type: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  className?: string;
  maxHeight?: number;
}

interface ErrorState {
  type: 'fetch' | 'mark-read' | 'mark-all-read' | 'connection';
  message: string;
  retryCount?: number;
}

interface NotificationStats {
  unreadCount: number;
  postCount: number;
  commentCount: number;
  totalCount: number;
}

// Custom hooks
const useNotificationStats = (
  notifications: Notification[],
): NotificationStats => {
  return useMemo(
    () => ({
      unreadCount: notifications.filter(n => !n.read_at).length,
      // Sử dụng cùng logic filtering như ở trên
      postCount: notifications.filter(
        n =>
          n.type === 'post' ||
          n.data.type_notification === 'post' ||
          n.type.includes('post') ||
          (n.data.post_id && !n.data.comment_id),
      ).length,
      commentCount: notifications.filter(
        n =>
          n.type === 'comment' ||
          n.data.type_notification === 'comment' ||
          n.type.includes('comment') ||
          n.data.comment_id,
      ).length,
      totalCount: notifications.length,
    }),
    [notifications],
  );
};

const useFilteredNotifications = (
  notifications: Notification[],
  activeTab: string,
): Notification[] => {
  return useMemo(() => {
    switch (activeTab) {
      case TAB_KEYS.UNREAD:
        return notifications.filter(n => !n.read_at);
      case TAB_KEYS.POST:
        // Sửa logic filtering cho posts - có thể type là 'post' hoặc kiểm tra theo type khác
        return notifications.filter(
          n =>
            n.type === 'post' ||
            n.data.type_notification === 'post' ||
            n.type.includes('post') ||
            (n.data.post_id && !n.data.comment_id), // Post notification thường có post_id nhưng không có comment_id
        );
      case TAB_KEYS.COMMENT:
        // Sửa logic filtering cho comments
        return notifications.filter(
          n =>
            n.type === 'comment' ||
            n.data.type_notification === 'comment' ||
            n.type.includes('comment') ||
            n.data.comment_id, // Comment notification có comment_id
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);
};

const useWebSocketConnection = (
  currentUserId: number | undefined,
  onNotificationReceived: (notification: Notification) => void,
) => {
  const channelsRef = useRef<{
    postChannel?: any;
    commentChannel?: any;
  }>({});

  useEffect(() => {
    if (!currentUserId || !window.Echo) return;

    try {
      // Setup post notifications channel
      const postChannel = window.Echo.channel('notifications');
      postChannel.listen(
        '.new-question-created',
        (notification: Notification) => {
          onNotificationReceived(notification);
        },
      );

      // Setup comment notifications channel
      const commentChannel = window.Echo.channel(
        `notifications-comment.${currentUserId}`,
      );
      commentChannel.listen(
        '.new-comment-created',
        (notification: Notification) => {
          onNotificationReceived(notification);
        },
      );

      channelsRef.current = { postChannel, commentChannel };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }

    return () => {
      try {
        const { postChannel, commentChannel } = channelsRef.current;

        if (postChannel) {
          postChannel.stopListening('.new-question-created');
          window.Echo.leave('notifications');
        }

        if (commentChannel) {
          commentChannel.stopListening('.new-comment-created');
          window.Echo.leave(`notifications-comment.${currentUserId}`);
        }

        channelsRef.current = {};
      } catch (error) {
        console.error('WebSocket cleanup error:', error);
      }
    };
  }, [currentUserId, onNotificationReceived]);
};

// API utilities

// Main component
const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications: initialNotifications = [],
  className,
  maxHeight = 500,
}) => {
  // State
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState(TAB_KEYS.ALL);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<ErrorState | null>(null);

  // Refs
  const apiClient = useMemo(() => createApiClient(), []);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Hooks
  const { props } = useTypedPage<{
    auth: { user: { id: number; role: string } };
  }>();
  const currentUserId = props.auth?.user?.id;
  const stats = useNotificationStats(notifications);
  const filteredNotifications = useFilteredNotifications(
    notifications,
    activeTab,
  );

  // Utility functions
  const showAlert = useCallback((message: string) => {
    setActiveAlert(message);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, CONSTANTS.ALERT_TIMEOUT);
  }, []);

  const showError = useCallback((errorState: ErrorState) => {
    setError(errorState);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, CONSTANTS.ERROR_TIMEOUT);
  }, []);

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;

        const newNotifications = [notification, ...prev];
        return newNotifications.slice(0, CONSTANTS.MAX_NOTIFICATIONS);
      });

      showAlert(notification.data.message);
    },
    [showAlert],
  );

  // WebSocket connection
  useWebSocketConnection(currentUserId, handleNewNotification);

  // API functions
  const fetchAllNotifications = useCallback(
    async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get('/notifications', {
          params: { limit: CONSTANTS.MAX_NOTIFICATIONS },
        });

        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);

        if (retryCount < CONSTANTS.MAX_RETRY_ATTEMPTS) {
          setTimeout(
            () => fetchAllNotifications(retryCount + 1),
            1000 * (retryCount + 1),
          );
          return;
        }

        showError({
          type: 'fetch',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load notifications. Please try again.',
          retryCount,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, showError],
  );
  console.log('fetchAllNotifications', fetchAllNotifications);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (markingAsRead.has(notificationId)) return;

      // Tìm notification trước khi mark as read
      const notificationToUpdate = notifications.find(
        n => n.id === notificationId,
      );
      if (!notificationToUpdate || notificationToUpdate.read_at) return;

      try {
        setMarkingAsRead(prev => new Set([...prev, notificationId]));

        await apiClient.post(`/notifications/${notificationId}/read`);

        // Update state ngay lập tức
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification,
          ),
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        showError({
          type: 'mark-read',
          message: 'Failed to mark notification as read.',
        });
      } finally {
        setMarkingAsRead(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    },
    [apiClient, notifications, markingAsRead, showError],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      setIsLoading(true);

      await apiClient.post('/notifications/read-all');

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError({
        type: 'mark-all-read',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to mark all notifications as read.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, showError]);

  // Effects
  useEffect(() => {
    // Chỉ fetch lại khi tab ALL và chưa có data, hoặc khi cần refresh
    if (activeTab === TAB_KEYS.ALL && notifications.length === 0) {
      fetchAllNotifications();
    }
    // Bỏ phần reset về initialNotifications vì nó sẽ làm mất những notification đã mark as read
  }, [activeTab, fetchAllNotifications]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Event handlers
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read_at) {
        markAsRead(notification.id);
      }
    },
    [markAsRead],
  );

  const getNotificationUrl = useCallback((notification: Notification) => {
    if (notification.type === 'comment') {
      return `/posts/${notification.data.slug}#comment-${notification.data.comment_id}`;
    }
    return `/posts/${notification.data.slug}`;
  }, []);

  // Render functions
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <Bell className="h-12 w-12 mb-2 text-gray-400" />
      <p className="text-sm">No notifications</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <Loader2 className="h-12 w-12 mb-2 animate-spin text-gray-400" />
      <p className="text-sm">Loading notifications...</p>
    </div>
  );

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        'flex items-start gap-3 p-4 transition-all duration-200 border-b last:border-0 relative hover:bg-gray-50 dark:hover:bg-gray-800/50',
        !notification.read_at && '',
      )}
    >
      <Avatar className="h-10 w-10 border rounded-lg flex-shrink-0">
        <AvatarImage
          src={notification.data.profile_photo_url}
          alt={notification.data.name || 'User'}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {notification.data.name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <Link
        href={getNotificationUrl(notification)}
        className="block flex-1 min-w-0"
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {notification.data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {notification.data.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {/*{formatTimeAgo(notification.created_at)}*/}
            {notification.created_at}
          </p>
        </div>
      </Link>

      {!notification.read_at && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              markAsRead(notification.id);
            }}
            disabled={markingAsRead.has(notification.id)}
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20"
            title="Mark as read"
          >
            {markingAsRead.has(notification.id) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Alert & Error Notifications */}
      <AnimatePresence mode="popLayout">
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px]"
          >
            <AlertInfoDemo title="New Notification" content={activeAlert} />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px]"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error.message}
                  </p>
                  {error.type === 'fetch' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllNotifications()}
                      className="mt-2 h-7 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {stats.unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse min-w-[20px]"
              >
                {stats.unreadCount > 99 ? '99+' : stats.unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[450px] p-0">
          <Card className={cn('w-full border-0 shadow-none', className)}>
            <CardHeader className="border-b py-3 space-y-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  Notifications
                </CardTitle>
                {stats.unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    className="text-sm hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mark all as read
                  </Button>
                )}
              </div>

              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value={TAB_KEYS.ALL} className="text-xs">
                    All ({stats.totalCount})
                  </TabsTrigger>
                  <TabsTrigger value={TAB_KEYS.UNREAD} className="text-xs">
                    Unread ({stats.unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value={TAB_KEYS.POST} className="text-xs">
                    Posts ({stats.postCount})
                  </TabsTrigger>
                  <TabsTrigger value={TAB_KEYS.COMMENT} className="text-xs">
                    Comments ({stats.commentCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <ScrollArea className="w-full" style={{ height: `${maxHeight}px` }}>
              <CardContent className="p-0">
                {isLoading && activeTab === TAB_KEYS.ALL
                  ? renderLoadingState()
                  : filteredNotifications.length === 0
                    ? renderEmptyState()
                    : filteredNotifications.map(renderNotification)}
              </CardContent>
            </ScrollArea>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NotificationsDropdown;
