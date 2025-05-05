import  React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/Components/Ticket/app-layout"
import { TooltipProvider } from "@/Components/ui/tooltip"
import { Toaster } from "sonner"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Checkbox } from "@/Components/ui/checkbox"
import { Search, Mail, Clock, MessageSquare, ChevronLeft, Bell, Settings, User, HelpCircle, LogOut } from "lucide-react"
import type { Department, Notification } from "@/types"
import useTypedPage from "@/Hooks/useTypedPage"
import PostContent from "@/Components/post-content"
import { router } from "@inertiajs/core"
import { route } from "ziggy-js"
import type { Post } from "@/types/Post"
import { Input } from "@/Components/ui/input"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"

interface Props {
    notifications: Notification[]
    department: Department
    posts: Post[]
    auth: { user: { id: number; name: string; profile_photo_path: string } }
}

export default function DepartmentShow({
                                           department,
                                           notifications: initialNotifications = [],
                                           posts: initialPosts = [],
                                           auth,
                                       }: Props) {
    const [localNotifications, setLocalNotifications] = useState<Notification[]>(initialNotifications)
    const [localPosts, setLocalPosts] = useState<Post[]>(initialPosts)
    const page = useTypedPage()
    const userId = page.props.auth?.user?.id
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [showPostView, setShowPostView] = useState(false)
    const currentUser = page.props.auth?.user || null;
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all")
    const user = auth?.user || null;
    // Memoize selectedPost to avoid unnecessary re-renders
    const selectedPost = useMemo(() => {
        return selectedNotification && selectedNotification.data.post_id
            ? localPosts.find((post) => post.id === selectedNotification.data.post_id) || null
            : null
    }, [selectedNotification, localPosts])

    // Filter notifications based on search query and active filter
    const filteredNotifications = useMemo(() => {
        return localNotifications.filter((notification) => {
            const matchesSearch =
                searchQuery === "" ||
                notification.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.data.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.data.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.data.product_name?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesFilter = activeFilter === "all" || (activeFilter === "unread" && !notification.read_at)

            return matchesSearch && matchesFilter
        })
    }, [localNotifications, searchQuery, activeFilter])

    // Handle new notifications via Echo
    useEffect(() => {
        if (!userId) return

        const postChannel = window.Echo.channel("notifications")
        postChannel.listen(".new-question-created", (e: Notification) => {
            const newNotification = {
                id: e.id,
                type: "post",
                data: e.data,
                read_at: null,
                created_at: e.created_at,
            }

            setLocalNotifications((prev) => {
                if (prev.some((notification) => notification.id === newNotification.id)) {
                    return prev
                }
                return [newNotification as Notification, ...prev]
            })
        })

        return () => {
            postChannel.stopListening(".new-question-created")
            window.Echo.leave("notifications")
        }
    }, [userId])

    // Handle mobile/desktop view
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            if (!mobile && !showPostView && localNotifications.length > 0) {
                setSelectedNotification(localNotifications[0])
            }
        }

        checkIfMobile()
        window.addEventListener("resize", checkIfMobile)

        return () => {
            window.removeEventListener("resize", checkIfMobile)
        }
    }, [showPostView, localNotifications])

    // Set default notification for desktop
    useEffect(() => {
        if (!isMobile && selectedNotification === null && localNotifications.length > 0) {
            setSelectedNotification(localNotifications[0])
        }
    }, [isMobile, localNotifications])

    // Handle notification click with lazy post fetching
    const handleNotificationSelect = useCallback(
        async (notification: Notification) => {
            if (isMobile) {
                setShowPostView(true)
            }

            const postId = notification.data.post_id
            let post = localPosts.find((p) => p.id === postId)

            if (!post) {
                try {
                    const response = await fetch(route("posts.showById", { id: postId }))
                    if (!response.ok) throw new Error("Failed to fetch post")
                    post = await response.json()

                    if (post) {
                        setLocalPosts((prev) => {
                            if (prev.some((p) => p.id === post!.id)) return prev
                            return [post!, ...prev]
                        })
                    }
                } catch (error) {
                    console.error("Error fetching post:", error)
                    return
                }
            }

            // Set notification after ensuring post exists
            setSelectedNotification(notification)
        },
        [localPosts, isMobile],
    )

    const handleMarkAsRead = useCallback((notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent notification selection when clicking checkbox

        if (notification.read_at) {
            // If already read, do nothing
            return
        }

        router.post(
            route("notifications.read_all", { id: notification.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalNotifications((prev) =>
                        prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)),
                    )
                },
            },
        )
    }, [])

    const handleBackToList = useCallback(() => {
        setShowPostView(false)
    }, [])

    const handleCommentSubmit = useCallback(
        (content: string, parentId?: number) => {
            if (!selectedPost) return

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
                        console.error("Error submitting comment:", errors)
                    },
                },
            )
        },
        [selectedPost],
    )

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 60) {
            return `${diffMins}m ago`
        } else if (diffHours < 24) {
            return `${diffHours}h ago`
        } else if (diffDays < 7) {
            return `${diffDays}d ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    return (
        <TooltipProvider>
            <AppLayout title={department.name}>
                {/* Main Header */}
                <header className="h-16 border-b dark:border-gray-800 bg-background flex items-center justify-between px-4 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-lg">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Settings className="h-5 w-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-10 w-10 rounded-lg">
                                        <AvatarImage
                                            src={
                                                currentUser?.profile_photo_path
                                                    ? `/storage/${currentUser.profile_photo_path}`
                                                    : `https://ui-avatars.com/api/?name=${encodeURI(user?.name)}&color=7F9CF5&background=EBF4FF`
                                            }
                                            alt={currentUser?.name}
                                        />
                                        <AvatarFallback>{currentUser?.name?.[0] ?? "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{currentUser?.name || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {currentUser?.email || "user@example.com"}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex overflow-hidden h-[calc(100vh-4rem)] dark:bg-[#0F1014] relative">
                    {/* Sidebar / Notification List */}
                    <div
                        className={cn(
                            "flex-col border-r dark:border-gray-800 bg-background",
                            "w-full md:w-96 lg:w-[400px] h-full",
                            isMobile && showPostView ? "hidden" : "flex",
                        )}
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 border-b dark:border-gray-800 bg-background flex flex-col gap-3">
                            {/*<div className="flex items-center justify-between">*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <h2 className="text-xl font-semibold">Inbox</h2>*/}
                            {/*        <Badge variant="outline" className="ml-2">*/}
                            {/*            {filteredNotifications.filter((n) => !n.read_at).length} unread*/}
                            {/*        </Badge>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setActiveFilter(v as "all" | "unread")}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="unread">Unread</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    className="pl-9 w-full bg-muted/40"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>


                        </div>

                        {/* Notification List */}
                        <ScrollArea className="h-[calc(100vh-16rem)] w-full">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <Mail className="h-8 w-8 mb-2" />
                                    <p>No notifications found</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => {
                                    const isSelected = selectedNotification?.id === notification.id
                                    const isUnread = !notification.read_at

                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationSelect(notification)}
                                            className={cn(
                                                "w-full text-left p-4 cursor-pointer border-b dark:border-gray-800 hover:bg-accent/50 transition-colors",
                                                isSelected ? "bg-accent/70" : "",
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox for read status */}
                                                <div className="pt-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={!isUnread}
                                                        onCheckedChange={(checked) => {
                                                            if (checked && isUnread) {
                                                                handleMarkAsRead(notification, {} as React.MouseEvent)
                                                            }
                                                        }}
                                                        className="mt-0.5"
                                                    />
                                                </div>

                                                {/*<Avatar className="h-20 w-0 rounded-lg flex-shrink-0">*/}
                                                {/*    <AvatarImage src={notification.data.profile_photo_url || ""} />*/}
                                                {/*    <AvatarFallback className="bg-primary/10 text-primary">*/}
                                                {/*        {notification.data.name?.[0] ?? "?"}*/}
                                                {/*    </AvatarFallback>*/}
                                                {/*</Avatar>*/}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium text-sm truncate">{notification.data.name}</h3>
                                                        <div className="flex items-center gap-1 ml-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatDate(notification.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-sm font-medium mt-1">{notification.data.title}</h4>

                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.data.message}</p>

                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {notification.data.product_name && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {notification.data.product_name}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            {selectedPost?.comments?.length || 0}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </ScrollArea>
                    </div>

                    {/* Post Content */}
                    <div className={cn("flex-1 h-full overflow-hidden", isMobile && !showPostView ? "hidden" : "block")}>
                        {isMobile && showPostView && (
                            <div className="p-4 border-b dark:border-gray-800 flex items-center bg-background sticky top-0 z-10">
                                <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <span className="font-medium">Back to Inbox</span>
                            </div>
                        )}

                        {selectedPost ? (
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 md:p-6">
                                    <PostContent
                                        key={selectedPost.id}
                                        post={selectedPost}
                                        comments={selectedPost.comments}
                                        onCommentSubmit={handleCommentSubmit}
                                        showBorder={false}
                                        currentUser={user}
                                    />
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Mail className="h-16 w-16 mb-4 text-muted-foreground/50" />
                                <h3 className="text-xl font-medium mb-2">No post selected</h3>
                                <p className="text-center max-w-md">Select a notification from the inbox to view its content</p>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
            <Toaster />
        </TooltipProvider>
    )
}
