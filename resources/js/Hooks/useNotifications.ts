// / hooks/useNotifications.ts
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createApiClient } from '@/Utils/utils';
import { toast } from 'sonner';
import { CONSTANTS, ErrorState, Notification } from '@/types/Notification';


export const useNotifications = (initialNotifications: Notification[] = []) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());
  const [error, setError] = useState<ErrorState | null>(null);
  
  const apiClient = useMemo(() => createApiClient(), []);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showError = useCallback((errorState: ErrorState) => {
    setError(errorState);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, CONSTANTS.ERROR_TIMEOUT);
  }, []);

  const fetchAllNotifications = useCallback(async (retryCount = 0) => {
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
        setTimeout(() => fetchAllNotifications(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      showError({
        type: 'fetch',
        message: error instanceof Error ? error.message : 'Failed to load notifications. Please try again.',
        retryCount,
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, showError]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (markingAsRead.has(notificationId)) return;
    
    const notificationToUpdate = notifications.find(n => n.id === notificationId);
    if (!notificationToUpdate || notificationToUpdate.read_at) return;
    
    try {
      setMarkingAsRead(prev => new Set([...prev, notificationId]));
      
      await apiClient.post(`/notifications/${notificationId}/read`);
      
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
  }, [apiClient, notifications, markingAsRead, showError]);

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
        message: error instanceof Error ? error.message : 'Failed to mark all notifications as read.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, showError]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      const newNotifications = [notification, ...prev];
      return newNotifications.slice(0, CONSTANTS.MAX_NOTIFICATIONS);
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications,
    setNotifications,
    isLoading,
    markingAsRead,
    error,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    handleNewNotification,
    showError,
  };
};



