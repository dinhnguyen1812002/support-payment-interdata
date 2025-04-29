import React, { useState, useEffect } from "react";
import { AppLayout } from "@/Components/Ticket/app-layout";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { Toaster } from "sonner";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Search, Filter, Mail, ArrowLeft } from "lucide-react";
import {Notification, Department, Tag} from "@/types";
import useTypedPage from "@/Hooks/useTypedPage";
import PostContent from "@/Components/post-content";
import { router } from "@inertiajs/core";
import { route } from "ziggy-js";
import { Post } from "@/types/Post";

interface Props {
    notifications: Notification[];
    department: Department;
    posts: Post[];
    auth: { user: { id: number; name: string; profile_photo_path: string } };
}

export default function DepartmentShow({ department, notifications: initialNotifications = [], posts, auth }: Props) {
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);
    const page = useTypedPage();
    const userId = page.props.auth?.user?.id;
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showPostView, setShowPostView] = useState(false);
    const currentUser = auth?.user || null;

    useEffect(() => {
        if (!userId) return;

        const postChannel = window.Echo.channel("notifications");
        postChannel.listen(".new-question-created", (e: Notification) => {
            const newNotification = {
                ...e,
                type: "post",
                data: {
                    ...e.data,
                    post_id: e.data.post_id,
                    message: e.data.message,
                    title: e.data.title,
                    name: e.data.name,
                    profile_photo_url: e.data.profile_photo_url,
                    tags: e.data.tags || [],
                    categories: e.data.categories || [],
                },
                read_at: null,
                created_at: new Date().toISOString(),
            };

            setLocalNotifications((prev) => {
                // Check if notification already exists
                const exists = prev.some(notification => notification.id === newNotification.id);
                if (exists) return prev;

                // Add new notification at the beginning of the array
                return [newNotification, ...prev];
            });
        });

        return () => {
            postChannel.stopListening(".new-question-created");
            window.Echo.leave("notifications");
        };
    }, [userId]);

    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (!mobile && !showPostView) {
                setSelectedNotification(localNotifications[0]);
            }
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, [showPostView, localNotifications]);

    useEffect(() => {
        if (!isMobile && selectedNotification === null && localNotifications.length > 0) {
            setSelectedNotification(localNotifications[0]);
        }
    }, [isMobile, selectedNotification, localNotifications]);

    const handleNotificationSelect = (notification: Notification) => {
        setSelectedNotification(notification);
        if (isMobile) {
            setShowPostView(true);
        }
    };

    const handleBackToList = () => {
        setShowPostView(false);
    };

    const selectedPost = selectedNotification && selectedNotification.data.post_id
        ? posts.find((post) => post.id === selectedNotification.data.post_id)
        : null;

    const handleCommentSubmit = (content: string, parentId?: number) => {
        if (!selectedPost) return;

        router.post(
            route("comments.store"),
            {
                comment: content,
                post_id: selectedPost.id,
                parent_id: parentId || null,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error("Error submitting comment:", errors);
                },
            }
        );
    };

    return (
        <TooltipProvider>
            <AppLayout title={department.name}>
                <div className="flex overflow-hidden h-full dark:bg-[#0F1014] relative">
                    <div
                        className={`
                            ${isMobile && showPostView ? "hidden" : "flex"}
                            flex-col
                            w-full md:w-80 lg:w-96
                            h-full
                            border-r
                        `}
                    >
                        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="font-medium">Inbox</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(110vh-8rem)] w-full">
                            {localNotifications.map((notification) => {
                                const isSelected = selectedNotification?.id === notification.id;
                                const isUnread = !notification.read_at; // Kiểm tra thông báo chưa đọc

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationSelect(notification)}
                                        className={`w-full text-left p-3 cursor-pointer border-b hover:bg-accent/50 ${
                                            isSelected
                                                ? "border-l-4 border-l-blue-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-start gap-1">
                                            <Avatar className="h-10 w-10 mt-0.5 rounded-lg">
                                                <AvatarImage src={notification.data.profile_photo_url || ""} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {notification.data.name?.[0] ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-sm truncate">
                                                            {notification.data.name}
                                                        </h3>
                                                        {isUnread && (
                                                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm truncate mt-0.5">{notification.data.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {notification.data.message}
                                                </p>
                                                {/*<div className="mt-1 flex flex-wrap gap-1">*/}
                                                {/*    {notification.data.categories?.map((category: string) => (*/}
                                                {/*        <span*/}
                                                {/*            key={category}*/}
                                                {/*            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"*/}
                                                {/*        >*/}
                                                {/*            {category}*/}
                                                {/*        </span>*/}
                                                {/*    ))}*/}
                                                {/*    {notification.data.tags?.map((tag: string) => (*/}
                                                {/*        <span*/}
                                                {/*            key={tag}*/}
                                                {/*            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"*/}
                                                {/*        >*/}
                                                {/*            {tag}*/}
                                                {/*        </span>*/}
                                                {/*    ))}*/}

                                                {/*</div>*/}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </ScrollArea>
                    </div>

                    <div
                        className={`
                        flex-1
                        h-full
                        ${(isMobile && !showPostView) ? "hidden" : "block"}
                        overflow-y-auto
                    `}
                    >
                        {isMobile && showPostView && (
                            <div className="p-3 border-b flex items-center">
                                <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <span className="font-medium">Back to Inbox</span>
                            </div>
                        )}

                        {selectedPost ? (
                            <ScrollArea className="h-[calc(100vh-8rem)] w-full">
                                <PostContent
                                    post={selectedPost}
                                    comments={selectedPost.comments}
                                    currentUser={currentUser}
                                    onCommentSubmit={handleCommentSubmit}
                                    showBorder={false}
                                />
                            </ScrollArea>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <Mail className="h-10 w-10 mx-auto mb-3" />
                                <p>Select a notification to view the post</p>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
            <Toaster />
        </TooltipProvider>
    );
}
