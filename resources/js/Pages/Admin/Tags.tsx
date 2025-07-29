import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatDate } from 'date-fns';
import React, { useState } from 'react';
import { TagDialog } from '../Tags/TagDialog';
import { Inertia } from '@inertiajs/inertia';

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface TagsPageProps {
  tags: Tag[];
}

export default function TagsPage({ tags = [] }: TagsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  const handleOpenDialog = (tag?: Tag) => {
    setSelectedTag(tag);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTag(undefined);
    setDialogOpen(false);
  };
  const handleDelete = (tag: Tag) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${tag.name}?`)) {
      Inertia.delete(`/admin/tags/${tag.id}`);
    }
  };

  return (
    <SidebarProvider>
      <Head title={'Thẻ'} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Tất cả thẻ'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4 mr-4">
              {/* Header section with title, search and add button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Quản lý thẻ
                  </h2>
                  <p className="text-muted-foreground">
                    Quản lý thẻ và danh mục của bạn
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm thẻ..."
                      className="pl-8 w-[250px]"
                    />
                  </div> */}
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thẻ
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table className="border border-gray-200 rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag: Tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tag.slug}
                      </TableCell>
                      <TableCell>
                        {formatDate(tag.created_at, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(tag)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tag)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <TagDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          tag={selectedTag}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
