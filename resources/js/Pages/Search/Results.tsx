

import React from "react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"

export function CommandDialogDemo() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Sample data with title, content, and createdAt
    const searchItems = [
        {
            title: "Getting Started Guide",
            content: "Learn how to set up your new project with our framework",
            createdAt: "2023-05-12T10:30:00Z",
        },
        {
            title: "API Documentation",
            content: "Complete reference for all available endpoints and parameters",
            createdAt: "2023-06-24T14:15:00Z",
        },
        {
            title: "User Management",
            content: "How to handle user authentication and authorization",
            createdAt: "2023-07-03T09:45:00Z",
        },
        {
            title: "Performance Optimization",
            content: "Tips and tricks to make your application faster",
            createdAt: "2023-08-17T16:20:00Z",
        },
        {
            title: "Deployment Guide",
            content: "Step-by-step instructions for deploying to production",
            createdAt: "2023-09-05T11:10:00Z",
        },
    ]

    // Format date to a more readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search documents..." className="border-none focus:ring-0" />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Search Results">
                        {searchItems.map((item, index) => (
                            <CommandItem key={index} className="flex flex-col items-start py-3">
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="font-medium">{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

