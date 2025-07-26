import React, { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { AnimatePresence } from 'framer-motion';
import useTypedPage from '@/Hooks/useTypedPage';
import { useNotifications } from '@/Hooks/useNotifications';


import { NotificationTabs } from './NotificationTabs';
import { EmptyState, LoadingState } from './NotificationStates';
import { ErrorNotification } from './ErrorNotification';
import { useFilteredNotifications } from '@/Hooks/useFilteredNotifications';
import { useNotificationStats } from '@/Hooks/useNotificationStats';
import { useWebSocketConnection } from '@/Hooks/useWebSocketConnection';
import { NotificationItem } from './notification-item';
import { Notification } from '@/types/Notification';
const TAB_KEYS = {
  ALL: 'all',
  UNREAD: 'unread',
  POST: 'post',
  COMMENT: 'comment',
} as const;

interface NotificationsDropdownProps {
  notifications: Notification[];
  className?: string;
  maxHeight?: number;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications: initialNotifications = [],
  className,
  maxHeight = 500,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { props } = useTypedPage<{
    auth: { user: { id: number; role: string } };
  }>();
  const currentUserId = props.auth?.user?.id;

  const {
    notifications,
    isLoading,
    markingAsRead,
    hidingNotification,
    error,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    hideNotification,
    handleNewNotification,
  } = useNotifications(initialNotifications);

  const stats = useNotificationStats(notifications);
  const filteredNotifications = useFilteredNotifications(notifications, activeTab);

  // WebSocket connection
  useWebSocketConnection(currentUserId, handleNewNotification);

  // Effects
  useEffect(() => {
    if (activeTab === TAB_KEYS.ALL && notifications.length === 0) {
      fetchAllNotifications();
    }
  }, [activeTab, fetchAllNotifications, notifications.length]);

  return (
    <>
      {/* Error notification */}
      <AnimatePresence mode="popLayout">
        {error && (
          <ErrorNotification
            error={error}
            onRetry={error.type === 'fetch' ? fetchAllNotifications : undefined}
          />
        )}
      </AnimatePresence>

      {/* Main Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-10 w-10 border">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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
          <Card className={cn('w-full border-0 shadow-none dark:bg-[#0F1014]', className)}>
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

              <NotificationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                stats={stats}
              />
            </CardHeader>

            <ScrollArea className="w-full" style={{ height: `${maxHeight}px` }}>
              <CardContent className="p-0 dark:bg-[#0F1014]">
                {isLoading && activeTab === TAB_KEYS.ALL ? (
                  <LoadingState />
                ) : filteredNotifications.length === 0 ? (
                  <EmptyState />
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onHide={hideNotification}
                      isMarkingAsRead={markingAsRead.has(notification.id)}
                      isHiding={hidingNotification.has(notification.id)}
                    />
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