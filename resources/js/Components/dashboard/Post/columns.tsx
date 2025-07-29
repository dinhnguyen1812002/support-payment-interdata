import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
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
import { getStatusColor } from '@/Utils/utils';

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
    header: 'Người viết',
    cell: ({ row }) => {
      const user = row.getValue('user') as Post['user'];
      const avatarUrl = user.avatarUrl || (user.profile_photo_path ? `/storage/${user.profile_photo_path}` : null);
      return (
        <div className="flex items-center gap-2">
          <AvatarWithFallback
            src={avatarUrl}
            name={user.name}
            alt={user.name}
            className="h-8 w-8"
            variant="identicon"
            square={true}
          />
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
         Tiêu đề
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium max-w-[300px] truncate">
          <Link href={`/admin/tickets/${row.original.slug}`}>
            {row.getValue('title')}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'open':  
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Mở</Badge>;
          case 'in_progress':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Đang xử lý</Badge>;
          case 'resolved':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Đã xử lý</Badge>;
          case 'closed':
            return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Đóng</Badge>;
          default:
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{status || 'Unknown'}</Badge>;
        }
      };
      return getStatusBadge(status);

//  export const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'open':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'in-progress':
//         return 'bg-purple-100 text-purple-800 border-purple-200';
//       case 'waiting-response':
//         return 'bg-amber-100 text-amber-800 border-amber-200';
//       case 'resolved':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'closed':
//         return '';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
  // };

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
          Số bình chọn
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
          Số bình luận
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
          Ngày tạo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string;
    
      return (
        <span className="text-sm text-muted-foreground">
          {createdAt}
        </span>
      );
    },
  },
  {
    accessorKey: 'assignee',
    id: 'assignee',
    header: 'Ủy nhiệm',
    cell: ({ row }) => {
      const assignee = row.getValue('assignee') as Post['assignee'];

      if (!assignee) {
        return (
          <div className="text-sm text-muted-foreground">
            chưa được ủy nhiệm
          </div>
        );
      }

      const avatarUrl = assignee.avatarUrl || (assignee.profile_photo_path ? `/storage/${assignee.profile_photo_path}` : null);

      return (
        <div className="flex items-center gap-2">
          {/* <AvatarWithFallback
            src={avatarUrl}
            name={assignee.name}
            alt={assignee.name}
            className="h-6 w-6"
            variant="geometric"
            square={true}
            size={24}
          /> */}
          <AvatarWithFallback
            src={avatarUrl}
            name={assignee.name}
            alt={assignee.name}
            className="h-6 w-6"
            variant="identicon"
            square={true}
            size={24}
          />
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
                <span className="sr-only">Mở</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {/* <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(post.id)}
              >
                Copy post ID
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/admin/tickets/${post.slug}`}>Xem post</Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>Edit post</DropdownMenuItem>
              <DropdownMenuItem>View author profile</DropdownMenuItem> */}
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
               Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc là muốn xóa ticket này không</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn bài viết
                  "{post.title}" và loại bỏ tất cả dữ liệu liên quan khỏi hệ thống máy chủ của chúng tôi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
