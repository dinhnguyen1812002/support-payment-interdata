import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Badge } from "@/Components/ui/badge"
import { format } from "date-fns"
import React from "react"
import {Link} from "@inertiajs/react";
import {Checkbox} from "@/Components/ui/checkbox";

// Define the Post type
export type Post = {
    id: string;
    title: string;
    slug: string
    status: "published" | "private";
    votes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
    };
};

export const columns: ColumnDef<Post>[] = [
    {
        accessorKey: "user",
        header: "Author",
        cell: ({ row }) => {
            const user = row.getValue("user") as Post["user"]
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-md">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>

                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="font-medium max-w-[300px] truncate">
                <Link href={`/posts/${row.original.slug}`}  >
                    {row.getValue("title")}
                </Link>

            </div>
        },
    },

    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string

            return (
                <Checkbox >

                </Checkbox>
            )
        },
    },
    {
        accessorKey: "votes",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="whitespace-nowrap"
                >
                    Votes
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("votes")}</div>
        },
    },
    {
        accessorKey: "comments",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="whitespace-nowrap"
                >
                    Comments
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("comments")}</div>
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="whitespace-nowrap"
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{format(date, "dd/MM/yyyy")}</div>;
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="whitespace-nowrap"
                >
                    Updated At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("updatedAt"));
            return <div>{format(date, "dd/MM/yyyy")}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const post = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>Copy post ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View post</DropdownMenuItem>
                        <DropdownMenuItem>Edit post</DropdownMenuItem>
                        <DropdownMenuItem>View author profile</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

