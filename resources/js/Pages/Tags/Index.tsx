import React from 'react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { DataTable } from '@/Components/dashboard/Post/data-table';
import { columns } from '@/Components/dashboard/Post/columns';
export default function TagsIndex() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'All Post'} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4"></div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
