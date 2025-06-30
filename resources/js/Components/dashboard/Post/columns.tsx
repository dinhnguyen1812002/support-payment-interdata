import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Checkbox } from '@/Components/ui/checkbox';
import { route } from 'ziggy-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

import { useToast } from '@/Hooks/use-toast';

// Define the Post type to match backend data structure
export type Post = {
  id: string;
  title: string;
  slug?: string;
  status: string;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    profile_photo_path?: string;
  };
  categories?: any[];
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    profile_photo_path?: string;
  } | null;
  department?: any;
};

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: 'user',
    id: 'user',
    header: 'Author',
    cell: ({ row }) => {
      const user = row.getValue('user') as Post['user'];
      const avatarUrl = user.avatarUrl || (user.profile_photo_path ? `/storage/${user.profile_photo_path}` : null);
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-md">
            <AvatarImage src={avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    id: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium max-w-[300px] truncate">
          <Link href={`/posts/${row.original.slug}`}>
            {row.getValue('title')}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'published':
          case 'public':
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Published</Badge>;
          case 'private':
          case 'draft':
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Private</Badge>;
          case 'archived':
            return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Archived</Badge>;
          default:
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{status || 'Unknown'}</Badge>;
        }
      };
      return getStatusBadge(status);
    },
  },

  {
    accessorKey: 'upvotes_count',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="whitespace-nowrap"
        >
          Votes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue('upvotes_count') || 0}</div>;
    },
  },
  {
    accessorKey: 'comments_count',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="whitespace-nowrap"
        >
          Comments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue('comments_count') || 0}</div>;
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="whitespace-nowrap"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string;
      const date = new Date(createdAt);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      );
    },
  },
  {
    accessorKey: 'assignee',
    id: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => {
      const assignee = row.getValue('assignee') as Post['assignee'];

      if (!assignee) {
        return (
          <div className="text-sm text-muted-foreground">
            Unassigned
          </div>
        );
      }

      const avatarUrl = assignee.avatarUrl || (assignee.profile_photo_path ? `/storage/${assignee.profile_photo_path}` : null);

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarImage src={avatarUrl || undefined} alt={assignee.name} />
            <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{assignee.name}</span>
            <span className="text-xs text-muted-foreground">{assignee.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { toast, dismiss } = useToast();
      const post = row.original;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

      const handleDelete = () => {
        setDeleteDialogOpen(true);
      };

      const confirmDelete = () => {
        router.delete(route('posts.destroy', post.id), {
          preserveScroll: true,
          onSuccess: () => {
            toast({
              title: 'Deleted',
              description: 'Post deleted. Undo?',
              action: (
                <Button
                  variant="ghost"
                  onClick={() => {
                    dismiss();
                    router.post(route('posts.undo'), { post_id: post.id }, {
                      preserveScroll: true,
                      onSuccess: () => {
                        toast({ title: 'Restored', description: 'Post restored successfully' });
                      },
                      onError: () => {
                        toast({ title: 'Error', description: 'Unable to restore post', variant: 'destructive' });
                      },
                    });
                  }}
                >
                  Undo
                </Button>
              ),
            });
          },
          preserveState: true,
          onError: errors => {
            // Xử lý lỗi từ backend (ví dụ: không có quyền)
            console.error('Error deleting post:', errors);
            setDeleteDialogOpen(false);
          },
        });
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(post.id)}
              >
                Copy post ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/posts/${post.slug}`}>View post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Edit post</DropdownMenuItem>
              <DropdownMenuItem>View author profile</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  post "{post.title}" and remove all associated data from our
                  servers.
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
        </>
      );
    },
  },
];
