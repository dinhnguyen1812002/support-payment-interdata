import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {Notification, NotificationContextType} from "@/types";


 const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("/api/notifications", { withCredentials: true });
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    // Tính số thông báo chưa đọc
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    // Đánh dấu tất cả là đã đọc
    const markAllAsRead = async () => {
        try {
            await axios.post("/notifications/read-all", {}, { withCredentials: true });

            // Cập nhật trạng thái local
            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: new Date().toISOString(),
                }))
            );
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

