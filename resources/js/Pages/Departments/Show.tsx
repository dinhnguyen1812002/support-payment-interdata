import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/dashboard/app-sidebar";
import { SiteHeader } from "@/Components/dashboard/site-header";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import {DataTable} from "@/Components/dashboard/Post/data-table";
import {columns} from "@/Components/dashboard/Post/columns";

interface Department {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

interface Props {
    department: Department;
}

export default function DepartmentShow({ department }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    // Email data
    const emails = [
        {
            id: 1,
            sender: "William Smith",
            initials: "WS",
            email: "williamsmith@example.com",
            subject: "Meeting Tomorrow",
            preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like...",
            fullContent: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards,\nWilliam",
            date: "Oct 22, 2023, 9:00:00 AM",
            shortDate: "over 1 year ago",
            labels: ["meeting", "work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 3,
            sender: "Bob Johnson",
            initials: "BJ",
            email: "bobjohnson@example.com",
            subject: "Weekend Plans",
            preview: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some...",
            fullContent: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some team bonding time outside of work. Let me know if you're interested!",
            date: "Oct 15, 2022, 5:15:00 PM",
            shortDate: "about 2 years ago",
            labels: ["personal"],
            read: true
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
        {
            id: 2,
            sender: "Alice Smith",
            initials: "AS",
            email: "alicesmith@example.com",
            subject: "Re: Project Update",
            preview: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team...",
            fullContent: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done an excellent job with the implementation.",
            date: "Oct 20, 2023, 2:30:00 PM",
            shortDate: "over 1 year ago",
            labels: ["work", "important"],
            read: false
        },
    ];

    const [selectedEmail, setSelectedEmail] = useState(emails[0]);

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">

                            <div className="w-full shadow-sm h-full">
                                <CardHeader className="pb-0 pt-4 px-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-bold">Inbox</CardTitle>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="text-sm bg-gray-100 rounded-full px-4">
                                                All mail
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-sm rounded-full px-4">
                                                Unread
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left side - Email list */}
                                        <div className="w-full md:w-1/3 border-r">
                                            <div className="px-4 pt-2 pb-3">
                                                <div className="relative">
                                                    <svg
                                                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                        />
                                                    </svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="w-full border rounded-lg py-2 pl-10 pr-4 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <ScrollArea className="h-full">
                                                {emails.map((email) => (
                                                    <div
                                                        key={email.id}
                                                        className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-100 ${selectedEmail.id === email.id ? 'bg-gray-50' : ''}`}
                                                        onClick={() => setSelectedEmail(email)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-medium text-base">{email.sender}</h3>
                                                            <span className="text-xs text-gray-500">{email.shortDate}</span>
                                                        </div>
                                                        <h4 className="font-medium text-sm mt-1">{email.subject}</h4>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {email.preview}
                                                        </p>
                                                        <div className="flex gap-2 mt-2">
                                                            {email.labels.map((label) => (
                                                                <span
                                                                    key={label}
                                                                    className={`px-3 py-1 text-xs rounded-full ${
                                                                        label === 'important' ? 'bg-black text-white' :
                                                                            label === 'work' ? 'bg-gray-800 text-white' :
                                                                                'bg-gray-200 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                        </div>

                                        {/* Right side - Email content */}
                                        <div className="w-full md:w-2/3">
                                            <Card className="w-full max-w-2xl mx-auto mt-6">
                                                <CardHeader>
                                                    <CardTitle>Department Details</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-medium">Description</h3>
                                                        <p className="text-sm text-muted-foreground">{department.description || 'N/A'}</p>
                                                    </div>
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-medium">Created At</h3>
                                                        <p className="text-sm text-muted-foreground">{formatDate(department.created_at)}</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <Link href={`/departments/${department.id}/edit`}>
                                                            <Button variant="ghost">Edit</Button>
                                                        </Link>
                                                        <Link href="/departments">
                                                            <Button variant="secondary">Back</Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
