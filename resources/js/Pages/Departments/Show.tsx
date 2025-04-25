import React, { useState, useEffect } from "react"
import { AppLayout } from "@/Components/Ticket/app-layout"
import { TooltipProvider } from "@/Components/ui/tooltip"
import { Toaster } from "sonner"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Button } from "@/Components/ui/button"
import { Search, Filter, Mail, ArrowLeft } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import UpvoteButton from "@/Components/VoteButton"
import { Card } from "@/Components/ui/card"

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

    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [showPostView, setShowPostView] = useState(false)

    // Check if screen is mobile size
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            // Reset view when switching between mobile and desktop
            if (!mobile && !showPostView) {
                setSelectedEmail(emails[0])
            }
        }

        checkIfMobile()
        window.addEventListener('resize', checkIfMobile)

        return () => {
            window.removeEventListener('resize', checkIfMobile)
        }
    }, [showPostView])

    // Set default selected email for desktop view
    useEffect(() => {
        if (!isMobile && selectedEmail === null) {
            setSelectedEmail(emails[0])
        }
    }, [isMobile, selectedEmail])

    const handleEmailSelect = (email: Email) => {
        setSelectedEmail(email)
        if (isMobile) {
            setShowPostView(true)
        }
    }

    const handleBackToList = () => {
        setShowPostView(false)
    }

    const selectedPost = selectedEmail ? posts.find((post) => post.id === selectedEmail.id) : null

    return (
        <TooltipProvider>
            <AppLayout>
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
                        <ScrollArea className="h-full">
                            {emails.map((email) => {
                                const isSelected = selectedEmail?.id === email.id;

                                return (
                                    <div
                                        key={email.id}
                                        onClick={() => handleEmailSelect(email)}
                                        className={`w-full text-left p-3 cursor-pointer border-b hover:bg-accent/50 ${
                                            isSelected ? "border-l-4 border-l-blue-500" : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    >
                                        <div className="flex items-start gap-1">
                                            <Avatar className="h-10 w-10 mt-0.5 rounded-lg">
                                                <AvatarImage src={"http://localhost:8000/storage/profile-photos/8ZbgjCeJUhVQObkDLNmfC5biooFrONnmuOfNgQxC.jpg"} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {email.initials}
                                                </AvatarFallback>
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
                                );
                            })}
                        </ScrollArea>
                    </div>

                    {/* Post View - Always visible on desktop, conditionally visible on mobile */}
                    <div className={`
                        flex-1
                        h-full
                        ${(isMobile && !showPostView) ? 'hidden' : 'block'}
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
                        <div className="px-3 sm:px-4 md:px-6 py-4">
                            {selectedPost ? (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="p-4 sm:p-6">
                                        <h2 className="text-xl sm:text-2xl font-bold">{selectedPost.title}</h2>
                                        <div
                                            className="prose dark:prose-invert max-w-none mt-4"
                                            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                        />
                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage />
                                                    <AvatarFallback>{selectedPost.user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">{selectedPost.user.name}</span>
                                            </div>
                                            <UpvoteButton
                                                postId={selectedPost.id}
                                                initialUpvotes={selectedPost.upvotes_count}
                                                initialHasUpvoted={selectedPost.has_upvoted}
                                            />
                                        </div>
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
                </div>
            </AppLayout>
            <Toaster />
        </TooltipProvider>
    )
}
