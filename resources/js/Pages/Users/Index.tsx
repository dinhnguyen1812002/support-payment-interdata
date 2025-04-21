import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { PageProps } from '@inertiajs/core';
import React from 'react';
import { SiteHeader } from "@/Components/dashboard/site-header";
import { SectionCards } from "@/Components/dashboard/section-cards";
import UsersTable from "@/Pages/Users/user-table";

interface User {
    id: number;
    name: string;
    email: string;
    profile_photo_path: string | null;
    created_at: string;
    roles: string[];
}

interface Props extends PageProps {
    users?: {
        data: User[];
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    keyword?: string;
    notifications?: any[];
}

export default function Page({ users, keyword = '', notifications = [] }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <UsersTable users={users} keyword={keyword} notifications={notifications} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
