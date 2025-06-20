import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface ErrorNotificationProps {
  error: {
    type: string;
    message: string;
  };
  onRetry?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px]"
    >
      <div className="bg-red-50 dark:bg-[#1e1e1e] border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error.message}
            </p>
            {error.type === 'fetch' && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2 h-7 text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};