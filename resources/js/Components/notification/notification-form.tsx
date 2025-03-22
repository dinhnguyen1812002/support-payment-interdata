import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { formatDistanceToNow } from "date-fns"
import React from "react"

interface NotificationProps {
    userAvatar: string
    userInitials: string
    postTitle: string
    slug: string
    dateTime: Date
}

export default function NotificationForm({
                                             userAvatar = "/placeholder.svg?height=40&width=40",
                                             userInitials = "UN",
                                             postTitle = "New post published",
                                             slug = "new-post-published",
                                             dateTime = new Date(),
                                         }: NotificationProps) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
                <CardTitle>Notification</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={userAvatar} alt="User avatar" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-medium leading-none">{postTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                            Slug: <span className="font-mono text-xs">{slug}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(dateTime, { addSuffix: true })}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

