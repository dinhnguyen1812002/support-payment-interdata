import React, {useEffect, useState} from 'react';
import { BellRing, Check, Bell } from "lucide-react";
import { Link } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {Notification} from "@/types";



interface NotificationsDropdownProps {
    notifications: Notification[];
    className?: string;

}
import axios from 'axios';

const NotificationsDropdown = ({
                                   notifications,
                                   className,
                               }: NotificationsDropdownProps) => {
    const [localNotifications, setLocalNotifications] = useState(notifications);


    const [isPushEnabled, setIsPushEnabled] = useState(false);

    // Tính toán số lượng chưa đọc
    const unreadCount = (localNotifications || []).filter((n) => !n.read_at).length;

    // const unreadCount = localNotifications.filter((n) => !n.read_at).length;

    // Hàm đánh dấu tất cả là đã đọc
    const markAllAsRead = async () => {
        try {
            // Gửi request đến API
            await axios.post('/notifications/read-all');

            // Cập nhật trạng thái local
            setLocalNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: new Date().toISOString(), // Gán thời gian hiện tại
                }))
            );
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px]">
                <Card className={cn("w-full border-0 shadow-none", className)}>
                    <CardHeader>
                        <CardTitle>Thông báo</CardTitle>
                        <CardDescription>
                            {/*You have {unreadCount} unread messages.*/}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4">
                        {/* Push Notification Toggle */}
                        {/* <div className="flex items-center space-x-4 rounded-md border p-4">
                            <BellRing className="h-5 w-5" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Push Notifications
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Send notifications to device.
                                </p>
                            </div>
                            <Switch
                                checked={isPushEnabled}
                                onCheckedChange={setIsPushEnabled}
                            />
                        </div> */}

                        {/* List of Notifications */}
                        <div>
                            {localNotifications.map((notification, index) => (
                                <div
                                    key={index}
                                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                                >
                                    <span className={`flex h-2 w-2 translate-y-1 rounded-full ${notification.read_at ? 'bg-gray-400' : 'bg-sky-500'}`} />
                                    <div className="space-y-1">
                                        {notification.data.url ? (
                                            <Link href={notification.data.url} className="block">
                                                <p className="text-sm font-medium leading-none">
                                                    {notification.data.message}
                                                </p>
                                            </Link>
                                        ) : (
                                            <p className="text-sm font-medium leading-none">
                                                {notification.data.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    {/* Mark all as read */}
                    <CardFooter>
                        <Button className="w-full" onClick={markAllAsRead}>
                            <Check className="mr-2 h-4 w-4" />Đánh dấu đã đọc
                        </Button>
                    </CardFooter>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationsDropdown;
