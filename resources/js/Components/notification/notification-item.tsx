import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Circle } from "lucide-react"
import React from "react"

interface NotificationItemProps {
    userAvatar: string
    userInitials: string
    postTitle: string
    slug: string
    dateTime: Date
    isRead: boolean
}

export default function NotificationItem({
                                             userAvatar = "/placeholder.svg?height=40&width=40",
                                             userInitials = "UN",
                                             postTitle = "New post published",
                                             slug = "new-post-published",
                                             dateTime = new Date(),
                                             isRead = false,
                                         }: NotificationItemProps) {
    return (
        <div className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors">
            {!isRead && <Circle className="h-1.5 w-1.5 mt-3 fill-blue-500 text-blue-500 shrink-0" />}
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userAvatar} alt="User avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0">
                <h3 className={`font-medium leading-none ${!isRead ? "font-semibold" : ""}`}>{postTitle}</h3>
                <p className="text-sm text-muted-foreground truncate">
                    Slug: <span className="font-mono text-xs">{slug}</span>
                </p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(dateTime, { addSuffix: true })}</p>
            </div>
        </div>
    )
}

