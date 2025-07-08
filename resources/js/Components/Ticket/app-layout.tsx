import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/Components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import useTypedPage from '@/Hooks/useTypedPage';
import { Department, Notification } from '@/types';
import type { Post } from '@/types/Post';
import AppSidebar from '@/Components/Ticket/sidebar-nav';
import NotificationsDropdown from '@/Components/notification/Notifications';
import { NavigationProgress } from '@/Components/ui/navigation-progress';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  department: Department;
  notifications: Notification[];
  post: Post[];
}

export function AppLayout({
  children,
  title,
  department,
  post,
}: AppLayoutProps) {
  const page = useTypedPage();
  const currentUser = page.props.auth?.user;
  const username = currentUser?.name || undefined;

  return (
    <SidebarProvider>
      <NavigationProgress />
      <AppSidebar
        id={department?.id}
        name={department.name}
        slug={department.slug}
        description={null}
        created_at={''}
      />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height]
        ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b "
        >
          <div className="flex items-center gap-2 px-4 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="justify-end flex-1 flex items-center gap-2 pr-10">
            {/*<NotificationsDropdown notifications={notifications} />*/}
          </div>
        </header>
        {/*<div className="flex flex-1 flex-col gap-4 p-4 pt-0">*/}
        {/*  <div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*  </div>*/}
        {/*  <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />*/}
        {/*</div>*/}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
