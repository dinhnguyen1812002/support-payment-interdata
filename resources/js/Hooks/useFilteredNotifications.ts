

import { useMemo } from 'react';
import { Notification } from '@/types/Notification';

const TAB_KEYS = {
  ALL: 'all',
  UNREAD: 'unread',
  POST: 'post',
  COMMENT: 'comment',
} as const;

export const useFilteredNotifications = (notifications: Notification[], activeTab: string) => {
  return useMemo(() => {
    switch (activeTab) {
      case TAB_KEYS.UNREAD:
        return notifications.filter(n => !n.read_at);
      case TAB_KEYS.POST:
        return notifications.filter(n =>
          n.type === 'post' ||
          n.data.type_notification === 'post' ||
          n.type.includes('post') ||
          (n.data.post_id && !n.data.comment_id)
        );
      case TAB_KEYS.COMMENT:
        return notifications.filter(n =>
          n.type === 'comment' ||
          n.data.type_notification === 'comment' ||
          n.type.includes('comment') ||
          n.data.comment_id
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);
};