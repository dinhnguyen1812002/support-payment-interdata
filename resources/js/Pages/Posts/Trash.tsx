import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Head, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import type { Post } from '@/types'
import { SiteHeader } from '@/Components/dashboard/site-header'
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';

export default function Trash({ posts }: { posts: Post[] }) {
    return (
        <SidebarProvider>
            <Head title={'Trash'} />
            <AppSidebar />
            <SidebarInset>
                <SiteHeader title={'Trash'} />
                <div className="px-4 lg:px-6">
                    <Table className="border border-gray-200 rounded-lg overflow-hidden ">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Created at</TableHead>
                                <TableHead>Deleted at</TableHead>
                                <TableHead>Comments</TableHead>
                                <TableHead>Upvotes</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.id}</TableCell>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.created_at}</TableCell>
                                    <TableCell>{post.deleted_at}</TableCell>
                                    <TableCell>{post.comments_count}</TableCell>
                                    <TableCell>{post.upvotes_count}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" onClick={() => router.post(route('posts.restore', post.id))}>
                                            Restore
                                        </Button>
                                        <Button variant="ghost" onClick={() => router.post(route('posts.destroy', post.id))}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </SidebarInset>
        </SidebarProvider>

    )
}