import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Inertia } from "@inertiajs/inertia";
import React from "react";


interface  Role {
    key: string;
    name: string;
    permissions: string[];
    description: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    profile_photo_path: string | null;
    created_at: string;
    roles: Role[];
}

interface Props {
    users?: {
        data: User[];
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    keyword?: string;
    notifications?: any[];
}

export default function UsersTable({ users, keyword = "", notifications = [] }: Props) {
    const [search, setSearch] = useState(keyword);

    const handleSearch = () => {
        Inertia.get('/users', { search }, { preserveState: true });
    };

    if (!users || !users.data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    return (
        <div className="w-full">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Users</CardTitle>
                <div className="relative w-full sm:w-64">
                    <Input
                        type="search"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pr-8"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead className="hidden md:table-cell">Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length > 0 ? (
                                                    user.roles.map((role, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {typeof role === 'string' ? role : role.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">None</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{formatDate(user.created_at)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => users.prev_page_url && Inertia.get(users.prev_page_url)}
                        disabled={!users.prev_page_url}
                        className="w-full sm:w-auto"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Page {users.current_page} of {users.last_page} (Total: {users.total} users)
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => users.next_page_url && Inertia.get(users.next_page_url)}
                        disabled={!users.next_page_url}
                        className="w-full sm:w-auto"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

            </CardContent>
        </div>
    );
}
