import React, { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import { SidebarProvider, SidebarInset } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

import { Page, router } from '@inertiajs/core';
import { useToast } from '@/Hooks/use-toast';

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  posts_count?: number;
}

interface Props {
  props: {
    tags: {
      data: Tag[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    flash: {
      success?: string;
      error?: string;
    };
  };
}

export default function TagsPage(tags: Props) {
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Form for creating a new tag
  const createForm = useForm({
    name: '',
  });

  // Form for updating an existing tag
  const updateForm = useForm({
    name: '',
  });

  // Handle flash messages
  React.useEffect(() => {
    if (tags.props.flash.success) {
      toast({
        title: 'Success',
        description: tags.props.flash.success,
      });
    }
    if (tags.props.flash.error) {
      toast({
        title: 'Error',
        description: tags.props.flash.error,
        variant: 'destructive',
      });
    }
  }, [tags.props.flash]);

  // Handle create tag submission
  const handleCreateTag = () => {
    createForm.post('/tags', {
      onSuccess: () => {
        setOpenCreateDialog(false);
        createForm.reset();
      },
      onError: errors => {
        toast({
          title: 'Error',
          description: errors.name || 'Failed to create tag',
          variant: 'destructive',
        });
      },
    });
  };

  // Handle update tag submission
  const handleUpdateTag = () => {
    if (!editingTag) return;
    updateForm.put(`/tags/${editingTag.id}`, {
      onSuccess: () => {
        setOpenEditDialog(false);
        updateForm.reset();
        setEditingTag(null);
      },
      onError: errors => {
        toast({
          title: 'Error',
          description: errors.name || 'Failed to update tag',
          variant: 'destructive',
        });
      },
    });
  };

  // Handle delete tag
  const handleDeleteTag = (tag: Tag) => {
    useForm().delete(`/tags/${tag.id}`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Tag deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete tag',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="All Tags" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">
              {/* Create Tag Dialog */}
              <Dialog
                open={openCreateDialog}
                onOpenChange={setOpenCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button>Add New Tag</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Tag name"
                      value={createForm.data.name}
                      onChange={e => createForm.setData('name', e.target.value)}
                    />
                    {createForm.errors.name && (
                      <p className="text-sm text-red-500">
                        {createForm.errors.name}
                      </p>
                    )}
                    <Button
                      onClick={handleCreateTag}
                      disabled={createForm.processing}
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Tag Dialog */}
              <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Tag name"
                      value={updateForm.data.name}
                      onChange={e => updateForm.setData('name', e.target.value)}
                    />
                    {updateForm.errors.name && (
                      <p className="text-sm text-red-500">
                        {updateForm.errors.name}
                      </p>
                    )}
                    <Button
                      onClick={handleUpdateTag}
                      disabled={updateForm.processing}
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Tags Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Posts Count</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.props.tags.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>No tags found.</TableCell>
                    </TableRow>
                  ) : (
                    tags.props.tags.data.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>{tag.name}</TableCell>
                        <TableCell>{tag.slug}</TableCell>
                        <TableCell>{tag.posts_count ?? 0}</TableCell>
                        <TableCell>{tag.created_at}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTag(tag);
                              updateForm.setData('name', tag.name);
                              setOpenEditDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the tag "
                                  {tag.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTag(tag)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex justify-between mt-4">
                <Button
                  disabled={tags.props.tags.current_page === 1}
                  onClick={() =>
                    router.get(
                      `/tags?page=${tags.props.tags.current_page - 1}&per_page=${tags.props.tags.per_page}`,
                    )
                  }
                >
                  Previous
                </Button>
                <span>
                  Page {tags.props.tags.current_page} of{' '}
                  {tags.props.tags.last_page}
                </span>
                <Button
                  disabled={
                    tags.props.tags.current_page === tags.props.tags.last_page
                  }
                  onClick={() =>
                    router.get(
                      `/tags?post_page=${tags.props.tags.current_page + 1}&per_page=${tags.props.tags.per_page}`,
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
