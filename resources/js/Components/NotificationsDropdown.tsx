import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import useTypedPage from "@/Hooks/useTypedPage";
import { Link } from "@inertiajs/react";
import  React from 'react'
import {ReactBabelOptions} from "@vitejs/plugin-react";

interface Notification {
    id: string;
    data: {
        post_id?: number;
        title?: string;
        message: string;
        slug?: string;
        name?: string;
        profile_photo_url?: string;
        categories?: string[];
    };
    read_at: string | null;
    created_at: string;
    type: "post" | "comment";
}

interface NotificationsDropdownProps {
    notifications: Notification[];
    className?: string;
    maxHeight?: number;
}

const NotificationsDropdown = ({
                                   notifications: initialNotifications = [],
                                   className,
                                   maxHeight = 400,
                               }: NotificationsDropdownProps) => {
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);
    const { props } = useTypedPage<{ auth: { user: { id: number; role: string } } }>();
    const currentUserId = props.auth?.user?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const unreadCount = localNotifications.filter((n) => !n.read_at).length;

    useEffect(() => {

        // Listen for new notifications via Echo
        const channel = window.Echo.channel('notifications');
        channel.listen('.new-question-created', (e: Notification) => {
            setLocalNotifications((prev) => [e, ...prev]); // Add new notification to the top
        });
        channel.listen('.new-comment-created', (e:Notification)=>{
            setLocalNotifications((prev) => [e,...prev]);
        })

        // Cleanup on unmount
        return () => {
            channel.stopListening('.new-question-created');
            window.Echo.leave('notifications');
        };
    }, []);

    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            await axios.post("/notifications/read-all");
            setLocalNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read_at: new Date().toISOString() })),
            );
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

    const filteredNotifications = localNotifications.filter((notification) => {
        if (activeTab === "all") return true;
        if (activeTab === "post") return notification.type === "post";
        if (activeTab === "comment") return notification.type === "comment";
        return false;
    });

    const postCount = localNotifications.filter((n) => n.type === "post").length;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                    <Bell className="h-10 w-10 text-gray-600" />
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
            <DropdownMenuContent align="end" className="w-[450px] p-0">
                <Card className={cn("w-full border-0 shadow-none", className)}>
                    <CardHeader className="border-b py-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Thông Báo</CardTitle>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    disabled={isLoading}
                                    className="text-sm hover:text-blue-700"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Đánh dấu tất cả là đã đọc
                                </Button>
                            )}
                        </div>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                            <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="all" className="text-sm">
                                    All ({localNotifications.length})
                                </TabsTrigger>
                                <TabsTrigger value="post" className="text-sm">
                                   New Question ({postCount})
                                </TabsTrigger>
                                <TabsTrigger value="comment" className="text-sm">
                                   Comment({postCount})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <ScrollArea className={`max-h-[${maxHeight}px]`}>
                        <CardContent className="p-0">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <Bell className="h-12 w-12 mb-2 text-gray-400" />
                                    <p>Không có thông báo</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start gap-3 p-4 transition-colors cursor-pointer border-b last:border-0",
                                            !notification.read_at && "bg-gray-50 dark:bg-gray-800",
                                        )}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Avatar className="h-9 w-9 border rounded-lg">
                                                <AvatarImage
                                                    src={notification.data.profile_photo_url}
                                                    alt={notification.data.name || "User"}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {notification.data.name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs text-gray-600 mt-1">{notification.data.name}</p>
                                        </div>
                                        <Link href={`/posts/${notification.data.slug}`} className="block group">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{notification.data.title}</p>
                                                <p className="text-sm">{notification.data.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                                            </div>
                                        </Link>
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
