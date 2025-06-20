// components/NotificationItem.tsx
import React, { useCallback } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Link } from '@inertiajs/react';
import { Notification } from '@/types/Notification';
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead: boolean;
}


export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}) => {
  const getNotificationUrl = useCallback((notification: Notification) => {
    if (notification.type === 'comment') {
      return `/posts/${notification.data.slug}#comment-${notification.data.comment_id}`;
    }
    return `/posts/${notification.data.slug}`;
  }, []);

  const handleNotificationClick = useCallback(() => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
  }, [notification.read_at, notification.id, onMarkAsRead]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 transition-all duration-200 border-b last:border-0 relative hover:bg-gray-50 dark:hover:bg-gray-800/50',
        !notification.read_at && ''
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
        onClick={handleNotificationClick}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {notification.data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {notification.data.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notification.created_at}
          </p>
        </div>
      </Link>

      {!notification.read_at && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            disabled={isMarkingAsRead}
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20"
            title="Mark as read"
          >
            {isMarkingAsRead ? (
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
};