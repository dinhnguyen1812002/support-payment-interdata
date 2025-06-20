// hooks/useNotificationStats.ts
import { useMemo } from 'react';
import { NotificationData , Notification } from '@/types/Notification';

// interface Notification {
//     id: string;
//     data: NotificationData;
//     read_at: string | null;
//     created_at: string;
//     type: string;
//   }


export const useNotificationStats = (notifications: Notification[]) => {
  return useMemo(() => ({
    unreadCount: notifications.filter(n => !n.read_at).length,
    postCount: notifications.filter(n =>
      n.type === 'post' ||
      n.data.type_notification === 'post' ||
      n.type.includes('post') ||
      (n.data.post_id && !n.data.comment_id)
    ).length,
    commentCount: notifications.filter(n =>
      n.type === 'comment' ||
      n.data.type_notification === 'comment' ||
      n.type.includes('comment') ||
      n.data.comment_id
    ).length,
    totalCount: notifications.length,
  }), [notifications]);
};