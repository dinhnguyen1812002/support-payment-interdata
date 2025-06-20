export const CONSTANTS = {
    MAX_NOTIFICATIONS: 10,
    ERROR_TIMEOUT: 3000,
    MAX_RETRY_ATTEMPTS: 3,
  } as const;
  
 export interface NotificationData {
      post_id: string;
      title?: string;
      message: string;
      slug?: string;
      name?: string;
      profile_photo_url?: string;
      categories?: any[];
      type_notification?: string;
      comment_id?: string;
    }
    
 export interface Notification {
      id: string;
      data: NotificationData;
      read_at: string | null;
      created_at: string;
      type: string;
    }
    
 export interface ErrorState {
    type: 'fetch' | 'mark-read' | 'mark-all-read' | 'connection';
    message: string;
    retryCount?: number;
  }