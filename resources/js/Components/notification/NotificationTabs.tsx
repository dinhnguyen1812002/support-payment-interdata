import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

const TAB_KEYS = {
  ALL: 'all',
  UNREAD: 'unread',
  POST: 'post',
  COMMENT: 'comment',
} as const;

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    totalCount: number;
    unreadCount: number;
    postCount: number;
    commentCount: number;
  };
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onTabChange,
  stats,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
  );
};
