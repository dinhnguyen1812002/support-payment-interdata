import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
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
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/Components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import useTypedPage from "@/Hooks/useTypedPage";
import { Link } from "@inertiajs/react";
import React from "react";
import { Category } from "@/types";
import AlertInfoDemo from "@/Components/InfoAlert";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    data: {
        post_id?: number;
        title?: string;
        message: string;
        slug?: string;
        name?: string;
        profile_photo_url?: string;
        categories?: Category[];
        abcdef?: string;
    };
    read_at: string | null;
    created_at: string;
    type: "post" | "comment";
    abcdef?: string;
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
    const [activeAlert, setActiveAlert] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const { props } = useTypedPage<{ auth: { user: { id: number; role: string } } }>();
    const currentUserId = props.auth?.user?.id;

    const unreadCount = localNotifications.filter((n) => !n.read_at).length;
    const postCount = localNotifications.filter((n) => n.type === "post").length;
    const commentCount = localNotifications.filter((n) => n.type === "comment").length;

    const determineNotificationType = (notification: Notification): "post" | "comment" => {
        if (notification.abcdef === "comment" || notification.data?.abcdef === "comment") {
            return "comment";
        }
        return "post";
    };

    useEffect(() => {
        const processedNotifications = initialNotifications.map((notification) => ({
            ...notification,
            type: determineNotificationType(notification),
        }));
        setLocalNotifications(processedNotifications);
    }, [initialNotifications]);

    useEffect(() => {
        if (!currentUserId) return;

        const postChannel = window.Echo.channel("notifications");
        postChannel.listen(".new-question-created", (e: Notification) => {
            const newNotification = { ...e, type: "post" };
            setLocalNotifications((prev) => [{ ...e, type: "comment" }, ...prev]);
            setActiveAlert(newNotification.data.message);
            setTimeout(() => setActiveAlert(null), 5000);
        });

        const commentChannel = window.Echo.channel(`notifications-comment.${currentUserId}`);
        commentChannel.listen(".new-comment-created", (e: Notification) => {
            const newNotification = { ...e, type: "comment" };
            setLocalNotifications((prev) => [{ ...e, type: "comment" }, ...prev]);
            setActiveAlert(newNotification.data.message);
            setTimeout(() => setActiveAlert(null), 5000);
        });

        return () => {
            postChannel.stopListening(".new-question-created");
            commentChannel.stopListening(".new-comment-created");
            window.Echo.leave("notifications");
            window.Echo.leave(`notifications-comment.${currentUserId}`);
        };
    }, [currentUserId]);

    const markAllAsRead = async () => {
        try {
            setIsLoading(true);
            await axios.post("/notifications/read-all");
            setLocalNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: new Date().toISOString(),
                })),
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
        return notification.type === activeTab;
    });

    return (
        <>
            <AnimatePresence initial={false} mode="popLayout" >
                {activeAlert && (
                    <motion.li

                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px]"
                    >
                        <AlertInfoDemo title="You have new notification" content={activeAlert} />
                    </motion.li>
                )}
            </AnimatePresence>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-10 w-10 text-gray-600 dark:text-white" />
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
                                <CardTitle className="text-lg">Notification</CardTitle>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        disabled={isLoading}
                                        className="text-sm hover:text-blue-700"
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid grid-cols-3 w-full">
                                    <TabsTrigger value="all" className="text-sm">
                                        All ({localNotifications.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="post" className="text-sm">
                                        New Question ({postCount})
                                    </TabsTrigger>
                                    <TabsTrigger value="comment" className="text-sm">
                                        Comment ({commentCount})
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <ScrollArea style={{ maxHeight: maxHeight }}>
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
                                                !notification.read_at ,
                                            )}
                                        >
                                            <div className="flex flex-col items-center">
                                                <Avatar className="h-10 w-10 border rounded-lg">
                                                    <AvatarImage
                                                        src={notification.data.profile_photo_url}
                                                        alt={notification.data.name || "User"}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {notification.data.name?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-xs text-gray-600 mt-1">{notification.data.name}</p>
                                            </div>
                                            <Link href={`/posts/${notification.data.slug}`} className="block group flex-1">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{notification.data.title}</p>
                                                    <p className="text-sm">{notification.data.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTimeAgo(notification.created_at)}
                                                        {/*<ba className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">*/}
                                                        {/*    {notification.type === "comment" ? "Comment" : "Question"}*/}
                                                        {/*</ba>*/}
                                                        <Badge variant="outline" className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ">
                                                            {notification.type === "comment" ? "Comment" : "Question"}
                                                        </Badge>
                                                    </p>
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
        </>
    );
};

export default NotificationsDropdown;
