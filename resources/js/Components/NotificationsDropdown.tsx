import { useEffect, useState } from 'react';
import { Bell, Loader2, Check } from 'lucide-react';
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
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AlertInfoDemo from '@/Components/InfoAlert';
import useTypedPage from '@/Hooks/useTypedPage';
import { Category } from '@/types';
import React from 'react';
interface NotificationData {
  post_id: string;
  title?: string;
  message: string;
  slug?: string;
  name?: string;
  profile_photo_url?: string;
  categories?: Category[];
  type_notification?: string;
}

interface Notification {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  type: 'post' | 'comment';
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  className?: string;
  maxHeight?: number;
}

const NotificationsDropdown = ({
  notifications: initialNotifications = [],
  className,
  maxHeight = 500,
}: NotificationsDropdownProps) => {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const { props } = useTypedPage<{
    auth: { user: { id: number; role: string } };
  }>();
  const currentUserId = props.auth?.user?.id;

  const unreadCount = notifications.filter(n => !n.read_at).length;
  const postCount = notifications.filter(n => n.type === 'post').length;
  const commentCount = notifications.filter(n => n.type === 'comment').length;

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!currentUserId) return;

    const postChannel = window.Echo.channel('notifications');
    postChannel.listen('.new-question-created', (e: Notification) => {
      setNotifications(prev => [e, ...prev]);
      setActiveAlert(e.data.message);
      setTimeout(() => setActiveAlert(null), 5000);
    });

    const commentChannel = window.Echo.channel(
      `notifications-comment.${currentUserId}`,
    );
    commentChannel.listen('.new-comment-created', (e: Notification) => {
      setNotifications(prev => [e, ...prev]);
      setActiveAlert(e.data.message);
      setTimeout(() => setActiveAlert(null), 5000);
    });

    return () => {
      postChannel.stopListening('.new-question-created');
      commentChannel.stopListening('.new-comment-created');
      window.Echo.leave('notifications');
      window.Echo.leave(`notifications-comment.${currentUserId}`);
    };
  }, [currentUserId]);

  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(prev => [...prev, notificationId]);
      await axios.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setMarkingAsRead(prev => prev.filter(id => id !== notificationId));
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/notifications/read-all');
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read_at: new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  return (
    <>
      <AnimatePresence initial={false} mode="popLayout">
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
            <AlertInfoDemo title="Error" content={error} />
          </motion.div>
        )}
      </AnimatePresence>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-10 w-10 text-gray-600 dark:text-white" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[450px] p-0">
          <Card className={cn('w-full border-0 shadow-none', className)}>
            <CardHeader className="border-b py-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    className="text-sm hover:text-blue-700"
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
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all" className="text-sm">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="post" className="text-sm">
                    New Question ({postCount})
                  </TabsTrigger>
                  <TabsTrigger value="comment" className="text-sm">
                    Comment ({commentCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <ScrollArea className={`h-[${maxHeight}px] w-full`}>
              <CardContent className="p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mb-2 text-gray-400" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-4 transition-colors border-b last:border-0 relative',
                        !notification.read_at,
                      )}
                    >
                      <Avatar className="h-12 w-12 border rounded-lg">
                        <AvatarImage
                          src={notification.data.profile_photo_url}
                          alt={notification.data.name || 'User'}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {notification.data.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/posts/${notification.data.slug}`}
                        className="block flex-1"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {notification.data.name}
                          </p>
                          <p className="text-sm">{notification.data.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </Link>
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          disabled={markingAsRead.includes(notification.id)}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20"
                          title="Mark as read"
                        >
                          {markingAsRead.includes(notification.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {!notification.read_at && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NotificationsDropdown;
