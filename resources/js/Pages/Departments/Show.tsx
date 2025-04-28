import React, { useState, useEffect } from "react"
import { AppLayout } from "@/Components/Ticket/app-layout"
import { TooltipProvider } from "@/Components/ui/tooltip"
import { Toaster } from "sonner"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Button } from "@/Components/ui/button"
import { Search, Filter, Mail, ArrowLeft } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Notification ,Department } from "@/types"
import useTypedPage from "@/Hooks/useTypedPage"
import PostContent from "@/Components/post-content"
import {router} from "@inertiajs/core";
import {route} from "ziggy-js";

import {Post} from "@/types/Post";

interface Props {
    notifications: Notification[];
    department: Department;
    posts: Post[];
    auth: { user: { id: number; name: string; profile_photo_path: string } };
}

export default function DepartmentShow({ department, notifications: initialNotifications = [], posts, auth }: Props) {
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications);
    const page = useTypedPage()
    const userId = page.props.auth?.user?.id
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [showPostView, setShowPostView] = useState(false)
    const currentUser = auth?.user || null;

    useEffect(() => {
        if (!userId) return;

        const postChannel = window.Echo.channel("notifications");
        postChannel.listen(".new-question-created", (e: Notification) => {
            const newNotification = { ...e, type: "post" };

        });
        return () => {
            postChannel.stopListening(".new-question-created");
            window.Echo.leave("notifications");
        };
    }, [userId]);

    // Check if screen is mobile size
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            if (!mobile && !showPostView) {
                setSelectedNotification(localNotifications[0])
            }
        }

        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)

        return () => {
            window.removeEventListener('resize', checkIfMobile)
        }
    }, [showPostView, localNotifications])

    // Set default selected email for desktop view
    useEffect(() => {
        if (!isMobile && selectedNotification === null && localNotifications.length > 0) {
            setSelectedNotification(localNotifications[0])
        }
    }, [isMobile, selectedNotification, localNotifications])

    const handleNotificationSelect = (notification: Notification) => {
        setSelectedNotification(notification)
        if (isMobile) {
            setShowPostView(true)
        }
    }

    const handleBackToList = () => {
        setShowPostView(false)
    }

    const selectedPost = selectedNotification && selectedNotification.data.post_id
        ? posts.find((post) => post.id === selectedNotification.data.post_id)
        : null

    const handleCommentSubmit = (content: string, parentId?: number) => {
        if (!selectedPost) return;

        // Use Inertia router or whatever method your app uses to submit comments
        router.post(
            route('comments.store'),
            {
                comment: content,
                post_id: selectedPost.id,
                parent_id: parentId || null
            },
            {
                preserveScroll: true,
                onError: errors => {
                    console.error('Error submitting comment:', errors);
                },
            },
        );
    };

    return (
        <TooltipProvider>
            <AppLayout title={department.name}>
                <div className="shadow-xs w-full dark:bg-[#0F1014] z-10">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="border-b px-4 py-2 bg-muted/20 h-16">
                            <TabsList className="overflow-x-auto flex-nowrap">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="unread">Unread</TabsTrigger>
                                <TabsTrigger value="important">Important</TabsTrigger>
                                <TabsTrigger value="work">Work</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>

                <div className="flex overflow-hidden h-full dark:bg-[#0F1014] relative">
                    {/* Email List - Always visible on desktop, hidden on mobile when viewing post */}
                    <div
                        className={`
                            ${isMobile && showPostView ? 'hidden' : 'flex'}
                            flex-col
                            w-full md:w-80 lg:w-96
                            h-full
                            border-r
                        `}
                    >
                        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="font-medium">Inbox</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-10rem)] w-full">
                            {localNotifications.map((notification) => {
                                const isSelected = selectedNotification?.id === notification.id;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationSelect(notification)}
                                        className={`w-full text-left p-3 cursor-pointer border-b hover:bg-accent/50 ${
                                            isSelected ? "border-l-4 border-l-blue-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-start gap-1">
                                            <Avatar className="h-10 w-10 mt-0.5 rounded-lg">
                                                <AvatarImage src={notification.data.profile_photo_url || ''} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {notification.data.name?.[0] ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-medium text-sm truncate">{notification.data.name}</h3>
                                                    <span className="text-xs text-muted-foreground ml-2">{new Date(notification.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="text-sm truncate mt-0.5">{notification.data.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.data.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </ScrollArea>
                    </div>

                    {/* Post View - Always visible on desktop, conditionally visible on mobile */}
                    <div className={`
                        flex-1
                        h-full
                        ${(isMobile && !showPostView) ? 'hidden' : 'block'}
                        overflow-y-auto
                    `}>
                        {/* Mobile Back Button */}
                        {isMobile && showPostView && (
                            <div className="p-3 border-b flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleBackToList}
                                    className="mr-2"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <span className="font-medium">Back to Inbox</span>
                            </div>
                        )}

                        {/* Post Content */}
                        {selectedPost ? (
                            <PostContent
                                post={selectedPost}
                                comments={selectedPost.comments}
                                currentUser={currentUser}
                                onCommentSubmit={handleCommentSubmit}
                            />
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
    )
}
