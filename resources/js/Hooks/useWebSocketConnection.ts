// hooks/useWebSocketConnection.ts

import { useRef, useEffect } from "react";
import { Notification } from "@/types/Notification";


export const useWebSocketConnection = (
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
        const postChannel = window.Echo.channel('notifications');
        postChannel.listen('.new-question-created', (notification: Notification) => {
          onNotificationReceived(notification);
        });
  
        const commentChannel = window.Echo.channel(`notifications-comment.${currentUserId}`);
        commentChannel.listen('.new-comment-created', (notification: Notification) => {
          onNotificationReceived(notification);
        });
  
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