// export function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number,
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout;
//
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }
import axios, { AxiosError } from 'axios';

export const createApiClient = () => {
  const client = axios.create({
    timeout: 10000,
  });

  client.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timeout. Please try again.'));
      }
      if (error.response?.status === 404) {
        return Promise.reject(new Error('Notification not found.'));
      }
      // if (error.response?.status >= 500) {
      //     return Promise.reject(new Error('Server error. Please try again later.'));
      // }
      return Promise.reject(error);
    },
  );

  return client;
};


 export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  export const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiting-response':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


 export   const getPriorityLabel = (priority: string | undefined) => {
      switch (priority) {
        case 'low':
          return 'Thấp';
        case 'medium':
          return 'Trung bình';
        case 'high':
          return 'Cao';
        case 'urgent':
          return 'Khẩn cấp';
        default:
          return 'Không xác định';
      }
    };
  

  
  export  const getStatusLabel = (status: string | undefined) => {
      switch (status) {
        case 'open':
          return 'Mở';
        case 'in_progress':
          return 'Đang xử lý';
        case 'waiting-response':
          return 'Chờ phản hồi';
        case 'resolved':
          return 'Đã giải quyết';
        case 'closed':
          return 'Đã đóng';
        default:
          return 'Mở';
      }
    };