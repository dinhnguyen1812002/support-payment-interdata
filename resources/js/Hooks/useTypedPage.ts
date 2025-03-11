import { usePage } from '@inertiajs/react';
import {InertiaSharedProps, NotificationContextType} from '@/types';
import {createContext, useContext} from "react";

export default function useTypedPage<T = {}>() {
  return usePage<InertiaSharedProps<T>>();
}
 const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
 