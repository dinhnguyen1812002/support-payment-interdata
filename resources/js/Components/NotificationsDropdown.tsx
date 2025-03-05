import React, { useEffect, useState } from 'react';
import { Bell, Check, Loader2, X, AlertTriangle } from "lucide-react";
import { Link } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
interface Notification {
    id: string;
    data: {
        message: string;
        url?: string;
        type?: 'info' | 'success' | 'warning' | 'error';
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsDropdownProps {
    notifications: Notification[];
    className?: string;
    maxHeight?: number;
}

const NotificationsDropdown = ({
                                   notifications,
                                   className,
                                   maxHeight = 400
                               }: NotificationsDropdownProps) => {
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = localNotifications.filter((n) => !n.read_at).length;

    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            await axios.post('/notifications/read-all');
            setLocalNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: new Date().toISOString(),
                }))
            );
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setLocalNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type?: string) => {
        switch (type) {
            case 'success':
                return <Check className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <X className="h-4 w-4 text-red-500" />;
            default:
                return <Bell className="h-4 w-4 text-blue-500" />;
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return format(notificationDate, 'HH:mm', { locale: vi });
        } else if (diffInHours < 48) {
            return 'Hôm qua';
        } else {
            return format(notificationDate, 'dd/MM/yyyy', { locale: vi });
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-gray-100 focus-visible:ring-1 focus-visible:ring-gray-950"
                >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[380px] p-0"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <Card className={cn("w-full border-0 shadow-none", className)}>
                    <CardHeader className="border-b py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Thông báo</CardTitle>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    disabled={isLoading}
                                    className="text-sm  hover:text-blue-700"
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Đánh dấu tất cả đã đọc
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <ScrollArea className={`max-h-[${maxHeight}px]`}>
                        <CardContent className="p-0">
                            {localNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <Bell className="h-12 w-12 mb-2 text-gray-400" />
                                    <p>Không có thông báo nào</p>
                                </div>
                            ) : (
                                localNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-0",
                                            !notification.read_at && ""
                                        )}
                                        onClick={() => {
                                            if (notification.data.url) {
                                                window.location.href = notification.data.url;
                                            }
                                            if (!notification.read_at) {
                                                markAsRead(notification.id);
                                            }
                                        }}
                                    >
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.data.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm leading-5",
                                                !notification.read_at && "font-medium"
                                            )}>
                                                {notification.data.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2  rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </ScrollArea>

                    {/*{localNotifications.length > 0 && (*/}
                    {/*    <CardFooter className="border-t p-3">*/}
                    {/*        <Button*/}
                    {/*            variant="outline"*/}
                    {/*            className="w-full text-sm"*/}
                    {/*            onClick={() => {*/}
                    {/*                if (notifications[0]?.data.url) {*/}
                    {/*                    window.location.href = notifications[0].data.url;*/}
                    {/*                }*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            Xem tất cả thông báo*/}
                    {/*        </Button>*/}
                    {/*    </CardFooter>*/}
                    {/*)}*/}
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationsDropdown;