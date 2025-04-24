import React, { useState } from "react"
import { AppLayout } from "@/Components/Ticket/app-layout"
import { TooltipProvider } from "@/Components/ui/tooltip"
import { Toaster } from "sonner"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Search, Filter, Mail } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Link } from "@inertiajs/react"
import UpvoteButton from "@/Components/VoteButton"

interface Department {
    id: number
    name: string
    description: string | null
    created_at: string
}

interface Email {
    id: string
    sender: string
    initials: string
    email: string
    subject: string
    preview: string
    date: string
    shortDate: string
    labels: string[]
    read: boolean
}

interface Post {
    id: string
    title: string
    content: string
    user: { name: string; profile_photo_path: string }
    categories: { id: number; name: string }[]
    created_at: string
    upvotes_count: number
    has_upvoted: boolean
    comments: any[]
}

interface Props {
    department: Department
}

export default function DepartmentShow({ department }: Props) {
    const emails: Email[] = [
        {
            id: "1",
            sender: "William Smith",
            initials: "WS",
            email: "williamsmith@example.com",
            subject: "Meeting Tomorrow",
            preview: "Let's have a meeting tomorrow to discuss the project...",
            date: "Oct 22, 2023, 9:00:00 AM",
            shortDate: "over 1 year ago",
            labels: ["meeting", "work", "important"],
            read: false,
        },
        {
            id: "2",
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great!",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false,
        },
    ]

    const posts: Post[] = [
        {
            id: "1",
            title: "How to Build a Blog with Next.js",
            content: "<p>This is the content of the post related to the first email.</p>",
            user: { name: "John Doe", profile_photo_path: "" },
            categories: [{ id: 1, name: "Next.js" }],
            created_at: "Oct 22, 2023",
            upvotes_count: 10,
            has_upvoted: false,
            comments: [],
        },
        {
            id: "2",
            title: "Update on the Project",
            content: "<p>This is the content of the post related to the second email.</p>",
            user: { name: "Jane Doe", profile_photo_path: "" },
            categories: [{ id: 2, name: "React" }],
            created_at: "Oct 20, 2023",
            upvotes_count: 5,
            has_upvoted: true,
            comments: [],
        },
    ]

    const [selectedEmail, setSelectedEmail] = useState<Email>(emails[0])

    const selectedPost = posts.find((post) => post.id === selectedEmail.id)

    return (
        <TooltipProvider>
            <AppLayout>
                <div className="shadow-sm w-full">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="border-b px-4 py-2 bg-muted/20 h-16">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="unread">Unread</TabsTrigger>
                                <TabsTrigger value="important">Important</TabsTrigger>
                                <TabsTrigger value="work">Work</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>

                <div className="flex overflow-hidden h-[calc(100vh-12rem)]">
                    {/* Sidebar */}
                    <div className="w-full md:w-80 border-r">
                        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="font-medium">Inbox</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <ScrollArea className="h-full">
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    className={`p-3 cursor-pointer border-b hover:bg-accent/50 ${
                                        selectedEmail.id === email.id ? "bg-accent" : ""
                                    }`}
                                    onClick={() => setSelectedEmail(email)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 mt-0.5">
                                            <AvatarFallback className="bg-primary/10 text-primary">{email.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-sm truncate">{email.sender}</h3>
                                                <span className="text-xs text-muted-foreground ml-2">{email.shortDate}</span>
                                            </div>
                                            <h4 className="text-sm truncate mt-0.5">{email.subject}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{email.preview}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 px-6 py-4 overflow-y-auto">
                        {selectedPost ? (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                                <div
                                    className="prose dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8"><AvatarImage /><AvatarFallback>{selectedPost.user.name[0]}</AvatarFallback></Avatar>
                                        <span className="text-sm text-muted-foreground">{selectedPost.user.name}</span>
                                    </div>
                                    <UpvoteButton
                                        postId={selectedPost.id}
                                        initialUpvotes={selectedPost.upvotes_count}
                                        initialHasUpvoted={selectedPost.has_upvoted}
                                    />
                                </div>
                            </div>

                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <Mail className="h-10 w-10 mx-auto mb-3" />
                                <p>Select an email to view the post</p>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
            <Toaster />
        </TooltipProvider>
    )
}
