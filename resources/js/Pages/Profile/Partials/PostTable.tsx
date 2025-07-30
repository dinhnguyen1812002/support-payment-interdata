import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
  Trash2,
  MessageSquare,
  Eye,
  ArrowUp,
  EyeOff,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Link, router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
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
import { route } from 'ziggy-js';
import { Post } from '@/types';
import { useToast } from '@/Hooks/use-toast';
import { toast } from "sonner"
// import { useToast } from '@/Hooks/use-toast';
import { Toast } from '@/Components/ui/toast';
import { getStatusColor, getStatusLabel } from '@/Utils/utils';
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

export default function PostsTable({
  posts,
  pagination,
  keyword,
}: PostsTableProps) {
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(keyword || '');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts?.data || []);
  // const { toast } = useToast();

  // Update filtered posts when search query changes
  useEffect(() => {
    if (!posts?.data) return;

    if (searchQuery.trim() === '') {
      setFilteredPosts(posts.data);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = posts.data.filter(post =>
        post.title.toLowerCase().includes(query),
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts?.data]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // const handleRestore = (post: Post) => {
  //   setPostToDelete(post);
  //   setDeleteDialogOpen(true);
  // };

  const handleEdit = (slug: string) => {
    router.get(route('posts.edit', slug));
  };
  const handleRestore = (postId : string) => {
    router.post(route('posts.restore', postId), {}, {
      preserveState: true,
      onSuccess: () => {
        toast("Your have bên restore", {
          description: "",
          closeButton : true,
          duration : 5000,
          style: {
            background: "white",
            color: "black",
           
          },
        
        });
        setDeleteDialogOpen(false);
      },
    });
   
  };
  const confirmDelete = () => {
    if (postToDelete) {
      const postId = postToDelete.id;
      const postTitle = postToDelete.title;
      
      router.delete(route('posts.destroy', postId), {
        preserveState: true,
        onSuccess: () => {
         toast("Ticket has been deleted", {
          description: `${postToDelete.deleted_at} `,
          closeButton : true,
          duration : 5000,
          style: {
            background: "white",
            color: "black",
           
          },
          action: {
            label: "Restore",
            onClick: () => handleRestore(postId),
          },
        });
        },
      });
    }
    setDeleteDialogOpen(false);
  };

  if (!posts?.data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
           Bạn chưa có tickets nào
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full ">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
            <div className="h-10 w-10 flex items-center justify-center">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            {/* <Button
              onClick={() => {
                toast("Event has been created.")
              }}
            >
            Show Test Toast
          </Button> */}
          <Button  onClick={()=> router.visit(route('posts.create'))}>
            <PlusCircle />
          </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40%]">Tiêu đề</TableHead>
                <TableHead className="w-[15%]">Công khai</TableHead>
                <TableHead className="w-[15%]">Trạng thái</TableHead>
                <TableHead className="w-[15%]">Ngày tạo</TableHead>
                <TableHead className="w-[15%]">Thảo luận</TableHead>
                <TableHead className="w-[15%]">upvotes </TableHead>
                <TableHead className="w-[15%] text-right">Tính năng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post: Post) => (
                <TableRow key={post.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={route('posts.show', post.slug)}>
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.is_published ? 'outline' : 'default'}>
                      {post.status ? (
                        <Eye className="mr-1 h-3 w-3 inline" />
                      ) : (
                        <EyeOff className="mr-1 h-3 w-3 inline" />
                      )}
                      {post.is_published ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                   {post.status ? (
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusLabel(post.status)}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Unknown
                      </Badge>
                    )

                   }
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.created_at}
                    {/*{new Date(post.created_at).toLocaleDateString()}*/}
                  </TableCell>
                  <TableCell>
                    {/*<Badge variant="outline" className="font-normal">*/}
                    {/*   */}
                    {/*</Badge>*/}
                    <MessageSquare className="mr-1 h-3 w-3 inline" />
                    {post.comments_count}
                  </TableCell>
                  <TableCell>
                    {/*<Badge variant="outline" className="font-normal">*/}

                    {/*</Badge>*/}
                    <ArrowUp className="mr-1 h-3 w-3 inline text-green-600" />
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
                        {/* <Link href={route('/')}>

                                                </Link> */}
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* <Link href={route('profile.edit')}>Profile</Link> */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post)}
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
            onClick={() =>
              router.get(
                route('profile.show'),
                {
                  page: pagination.current_page - 1,
                  search: keyword,
                },
                {
                  preserveState: true,
                },
              )
            }
            disabled={!pagination.prev_page_url}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.get(
                route('profile.show'),
                {
                  page: pagination.current_page + 1,
                  search: keyword,
                },
                {
                  preserveState: true,
                },
              )
            }
            disabled={!pagination.next_page_url}
            className="gap-1"
          >
           Tiếp theo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc muốn xóa ticket này không?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn bài viết
                "{postToDelete?.title}" và loại bỏ tất cả dữ liệu liên quan khỏi hệ thống máy chủ của chúng tôi.  
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Thoát</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </div>
  );
}