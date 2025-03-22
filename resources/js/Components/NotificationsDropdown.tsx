import React, { useEffect, useState } from 'react';
import { Bell, Check, Loader2, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { User } from "@/types";

interface Notification {
    id: string;
    data: {
        post_id?: number;
        title?: string;
        message: string;
        slug?: string;
        url?: string;
        author: string;
        user: User; // User là một object
        avatar:string;
        categories?: string[];
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsDropdownProps {
    notifications: Notification[];
    className?: string;
    maxHeight?: number;
}

const NotificationsDropdown = ({ notifications: initialNotifications, className, maxHeight = 400 }: NotificationsDropdownProps) => {
    const [localNotifications, setLocalNotifications] = useState(initialNotifications);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = localNotifications.filter((n) => !n.read_at).length;

    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            await axios.post("/notifications/read-all");
            setLocalNotifications((prev) => prev.map((notification) => ({ ...notification, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return format(notificationDate, "HH:mm", { locale: vi });
        } else if (diffInHours < 48) {
            return "Hôm qua";
        } else {
            return format(notificationDate, "dd/MM/yyyy", { locale: vi });
        }
    };
    console.log(localNotifications)
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                    <Bell className="h-10 w-10 text-gray-600" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <Card className={cn("w-full border-0 shadow-none", className)}>
                    <CardHeader className="border-b py-3 flex justify-between">
                        <CardTitle className="text-lg">
                            Notification
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={isLoading} className="text-sm hover:text-blue-700">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Mark all as read
                                </Button>
                            )}
                        </CardTitle>


                    </CardHeader>
                    <ScrollArea className={`max-h-[${maxHeight}px]`}>
                        <CardContent className="p-0">
                            {localNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <Bell className="h-12 w-12 mb-2 text-gray-400" />
                                    <p>No Notifications</p>
                                </div>
                            ) : (
                                localNotifications.map((notification) => (
                                    <div key={notification.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-0">
                                        <Avatar className="h-9 w-9 border rounded-lg">
                                            <AvatarImage
                                                src={
                                                    notification.data.user?.profile_photo_path
                                                        ? `/storage/${notification.data.avatar}`
                                                        : `https://ui-avatars.com/api/?name=${encodeURI(notification.data.author)}&color=7F9CF5&background=EBF4FF`
                                                }
                                                alt={notification.data.user?.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-primary">{notification.data.user?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            {/*<p className="text-sm font-medium">{notification.data.title}</p>*/}
                                            <p className="text-sm font-medium">{notification.data.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </ScrollArea>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationsDropdown;
