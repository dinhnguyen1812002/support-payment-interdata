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
