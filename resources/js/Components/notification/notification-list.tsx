
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import NotificationItem from "./notification-item"
import { useState } from "react"
import React from "react"

const sampleNotifications = [
    {
        id: 1,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "JD",
        postTitle: "How to Build a Blog with Next.js",
        slug: "how-to-build-a-blog-with-nextjs",
        dateTime: new Date(2025, 2, 20),
        isRead: false,
    },
    {
        id: 2,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "AS",
        postTitle: "Getting Started with Tailwind CSS",
        slug: "getting-started-with-tailwind-css",
        dateTime: new Date(2025, 2, 19),
        isRead: false,
    },
    {
        id: 3,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "MK",
        postTitle: "React Server Components Explained",
        slug: "react-server-Components-explained",
        dateTime: new Date(2025, 2, 18),
        isRead: true,
    },
    {
        id: 4,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "LW",
        postTitle: "Building a Dashboard with shadcn/ui",
        slug: "building-a-dashboard-with-shadcn-ui",
        dateTime: new Date(2025, 2, 17),
        isRead: false,
    },
    {
        id: 5,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "RJ",
        postTitle: "Authentication Patterns in Next.js",
        slug: "authentication-patterns-in-nextjs",
        dateTime: new Date(2025, 2, 16),
        isRead: true,
    },
    {
        id: 6,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "PL",
        postTitle: "State Management with Zustand",
        slug: "state-management-with-zustand",
        dateTime: new Date(2025, 2, 15),
        isRead: false,
    },
    {
        id: 7,
        userAvatar: "/placeholder.svg?height=40&width=40",
        userInitials: "TH",
        postTitle: "Optimizing Images in Next.js",
        slug: "optimizing-images-in-nextjs",
        dateTime: new Date(2025, 2, 14),
        isRead: false,
    },
]

export default function NotificationList() {
    const [notifications, setNotifications] = useState(sampleNotifications)

    const unreadCount = notifications.filter((n) => !n.isRead).length

    const markAllAsRead = () => {
        setNotifications(
            notifications.map((notification) => ({
                ...notification,
                isRead: true,
            })),
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="py-1.5 px-3 flex flex-row items-center justify-between">
                <CardTitle>Notification {unreadCount > 0 && `(${unreadCount})`}</CardTitle>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0 pt-1">
                <ScrollArea className="h-[300px]">
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                userAvatar={notification.userAvatar}
                                userInitials={notification.userInitials}
                                postTitle={notification.postTitle}
                                slug={notification.slug}
                                dateTime={notification.dateTime}
                                isRead={notification.isRead}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

