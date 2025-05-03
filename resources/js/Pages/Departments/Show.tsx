import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/Components/Ticket/app-layout";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { Toaster } from "sonner";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Search, Filter, Mail, ArrowLeft } from "lucide-react";
import {Category, Department, Notification, Tag} from "@/types";
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

export default function DepartmentShow({ department, notifications: initialNotifications = [], posts: initialPosts = [], auth }: Props) {
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);
    const [localPosts, setLocalPosts] = useState<Post[]>(initialPosts);
    const page = useTypedPage();
    const userId = page.props.auth?.user?.id;
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showPostView, setShowPostView] = useState(false);
    const currentUser = auth?.user || null;

    // Memoize selectedPost to avoid unnecessary re-renders
    const selectedPost = useMemo(() => {
        return selectedNotification && selectedNotification.data.post_id
            ? localPosts.find((post) => post.id === selectedNotification.data.post_id) || null
            : null;
    }, [selectedNotification, localPosts]);

    // Handle new notifications via Echo
    useEffect(() => {
        if (!userId) return;

        const postChannel = window.Echo.channel("notifications");
        postChannel.listen(".new-question-created", (e: Notification) => {
            const newNotification = {
                id: e.id,
                type: "post",
                data: e.data,
                read_at: null,
                created_at: e.created_at,
            };

            setLocalNotifications((prev) => {
                if (prev.some((notification) => notification.id === newNotification.id)) {
                    return prev;
                }
                return [newNotification as Notification, ...prev];
            });
        });

        return () => {
            postChannel.stopListening(".new-question-created");
            window.Echo.leave("notifications");
        };
    }, [userId]);

    // Handle mobile/desktop view
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (!mobile && !showPostView && localNotifications.length > 0) {
                setSelectedNotification(localNotifications[0]);
            }
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, [showPostView, localNotifications]);
        console.log(localNotifications)
    // Set default notification for desktop
    useEffect(() => {
        if (!isMobile && selectedNotification === null && localNotifications.length > 0) {
            setSelectedNotification(localNotifications[0]);
        }
    }, [isMobile, localNotifications]);

    // Handle notification click with lazy post fetching
    const handleNotificationSelect = useCallback(
        async (notification: Notification) => {
            if (isMobile) {
                setShowPostView(true);
            }

            const postId = notification.data.post_id;
            let post = localPosts.find((p) => p.id === postId);

            if (!post) {
                try {
                    const response = await fetch(route("posts.showById", { id: postId }));
                    if (!response.ok) throw new Error("Failed to fetch post");
                    post = await response.json();

                    if (post) {
                        setLocalPosts((prev) => {
                            if (prev.some((p) => p.id === post!.id)) return prev;
                            return [post!, ...prev];
                        });
                    }
                } catch (error) {
                    console.error("Error fetching post:", error);
                    return;
                }
            }

            // 🔑 Sau khi chắc chắn post đã có, mới set notification
            setSelectedNotification(notification);

            // if (!notification.read_at) {
            //     router.post(
            //         route("notifications.read_all", { id: notification.id }),
            //         {},
            //         {
            //             preserveScroll: true,
            //             onSuccess: () => {
            //                 setLocalNotifications((prev) =>
            //                     prev.map((n) =>
            //                         n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
            //                     )
            //                 );
            //             },
            //         }
            //     );
            // }
        },
        [localPosts, isMobile]
    );


    const handleBackToList = useCallback(() => {
        setShowPostView(false);
    }, []);

    const handleCommentSubmit = useCallback(
        (content: string, parentId?: number) => {
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
        },
        [selectedPost]
    );

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
                        <div className="p-3 border-b bg-muted/30 flex items-center justify-between h-16">
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
                        <ScrollArea className="h-[calc(100vh-8rem)] w-full">
                            {localNotifications.map((notification) => {
                                const isSelected = selectedNotification?.id === notification.id;
                                const isUnread = !notification.read_at;

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
                                                {/*    {notification.data.categories?.map((category: Category) => (*/}
                                                {/*        <span*/}
                                                {/*            key={category.id}*/}
                                                {/*            className="text-xs border border-dashed border-gray-300 hover:border-blue-600 text-black px-2 py-1 rounded dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400"*/}
                                                {/*        >*/}
                                                {/*            {category.title}*/}
                                                {/*        </span>*/}

                                                {/*    ))}*/}
                                                {/*    {notification.data.tags?.map((tag: Tag) => (*/}
                                                {/*        <span*/}
                                                {/*            key={tag.id}*/}
                                                {/*            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300"*/}
                                                {/*        >*/}
                                                {/*            {tag.name}*/}
                                                {/*        </span>*/}
                                                {/*     ))}*/}
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
                            <ScrollArea className="h-screen w-full">
                                <PostContent
                                    key={selectedPost.id}
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
