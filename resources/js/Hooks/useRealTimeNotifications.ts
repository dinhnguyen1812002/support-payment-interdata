import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { Notification } from "@/types"; // Đảm bảo bạn có interface Notification

type SetNotificationsType = React.Dispatch<React.SetStateAction<Notification[]>>;

const useRealTimeNotifications = (setLocalNotifications: SetNotificationsType) => {
    useEffect(() => {
        // Khởi tạo Echo và kết nối với Pusher
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
        });

        // Lắng nghe sự kiện từ channel "questions"
        window.Echo.channel("questions")
            .listen(".new-question", (data: { title: string; url: string }) => {
                console.log("New question received:", data);

                // Cập nhật danh sách thông báo mới
                setLocalNotifications((prev) => [
                    {
                        id: Date.now().toString(),
                        data: {
                            message: `Có một câu hỏi mới: ${data.title}`,
                            url: data.url,
                            type: "info",
                        },
                        read_at: null,
                        created_at: new Date().toISOString(),
                    },
                    ...prev,
                ]);
            });

        return () => {
            window.Echo.leaveChannel("questions");
        };
    }, []);
};

export default useRealTimeNotifications;
