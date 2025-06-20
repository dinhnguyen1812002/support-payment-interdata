import React from 'react';
import { Bell, Loader2 } from 'lucide-react';

export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
    <Bell className="h-12 w-12 mb-2 text-gray-400" />
    <p className="text-sm">No notifications</p>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
    <Loader2 className="h-12 w-12 mb-2 animate-spin text-gray-400" />
    <p className="text-sm">Loading notifications...</p>
  </div>
);