import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Pencil,
    Trash2,
    MessageSquare,
    Eye,
    ArrowUp,
    EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {Link, router} from '@inertiajs/react';
import { Badge } from "@/Components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { route } from "ziggy-js";
import {Checkbox} from "@/Components/ui/checkbox";
import {Post} from "@/types";



interface PostsTableProps {
    posts: {
        data: Post[];
    };
    pagination: {
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    keyword: string;
}

export default function PostsTable({ posts, pagination, keyword }: PostsTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<Post | null>(null);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(route('profile.show'), {
            search: formData.get('search') as string
        }, {
            preserveState: true
        });
    };
    console.log(posts);
    const handleEdit = (slug: string) => {
        router.get(route('posts.edit', slug));
    };

    const handleDelete = (post: Post) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            router.delete(route('posts.destroy', postToDelete.slug), {
                preserveState: true
            });
        }
        setDeleteDialogOpen(false);
    };

    if (!posts?.data) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">No posts found</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full ">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="search"
                            placeholder="Search questions..."
                            name="search"
                            defaultValue={keyword}
                            className="w-full"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                            <Search className="h-4 w-4"/>
                        </Button>
                    </form>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">

                                <TableHead className="w-[40%]">Title</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="w-[15%]">Created at</TableHead>
                                <TableHead className="w-[15%]">Comments</TableHead>
                                <TableHead className="w-[15%]">Upvotes</TableHead>
                                <TableHead className="w-[15%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.data.map((post: Post) => (
                                <TableRow key={post.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link href={route('posts.show', post.slug)}>
                                            {post.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.is_published ? "outline" : "default"}>
                                            {post.is_published ? (

                                                <Eye className="mr-1 h-3 w-3 inline"/>
                                            ) : (
                                                <EyeOff className="mr-1 h-3 w-3 inline"/>
                                            )}
                                            {post.is_published ? "Public" : "Private"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {post.created_at}
                                        {/*{new Date(post.created_at).toLocaleDateString()}*/}
                                    </TableCell>
                                    <TableCell>
                                        {/*<Badge variant="outline" className="font-normal">*/}
                                        {/*   */}
                                        {/*</Badge>*/}
                                        <MessageSquare className="mr-1 h-3 w-3 inline"/>
                                        {post.comments_count}
                                    </TableCell>
                                    <TableCell>
                                        {/*<Badge variant="outline" className="font-normal">*/}

                                        {/*</Badge>*/}
                                        <ArrowUp className="mr-1 h-3 w-3 inline text-green-600"/>
                                        {post.upvotes_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(post.slug)}
                                                className="h-8 w-8 hover:bg-muted"
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(post)}
                                                className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('profile.show'), {
                            page: pagination.current_page - 1,
                            search: keyword
                        }, {
                            preserveState: true
                        })}
                        disabled={!pagination.prev_page_url}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.current_page} of {pagination.last_page}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('profile.show'), {
                            page: pagination.current_page + 1,
                            search: keyword
                        }, {
                            preserveState: true
                        })}
                        disabled={!pagination.next_page_url}
                        className="gap-1"
                    >
                        Next
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your post
                                and remove all associated data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </div>
    );
}
