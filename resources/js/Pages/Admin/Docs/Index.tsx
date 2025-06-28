import React from 'react';
import { Head, Link } from '@inertiajs/react';

import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
// import { formatDistanceToNow } from 'date-fns';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { PageTransition } from '@/Components/ui/page-transition';
import { SidebarProvider, SidebarInset } from '@/Components/ui/sidebar';
import { route } from 'ziggy-js';

interface FileItem {
  name: string;
  preview: string;
  last_modified: number;
  size: string;
}

interface Props {
  files: FileItem[];
}

export default function DocsIndex({ files }: Props) {
  return (
    <SidebarProvider>
    <Head title="Documentation" />
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader title="Documentation" />
      <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Documentation</h2>
        <Link href={route('admin.docs.show')}>
          <Button>
            View Documentation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Files</CardTitle>
          <CardDescription>Manage your documentation files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length > 0 ? (
                files.map((file) => (
                  <TableRow key={file.name}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{file.preview}</TableCell>
                    <TableCell>
                      {/* {formatDistanceToNow(new Date(file.last_modified * 1000), { addSuffix: true })} */}
                    </TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell className="text-right">
                      <Link href={route('admin.docs.show', { file: file.name })} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No documentation files found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
      </PageTransition>
    </SidebarInset>
  </SidebarProvider>
    
  );
}
