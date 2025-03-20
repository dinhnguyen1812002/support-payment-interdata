import React from "react";
import { SidebarProvider, SidebarInset } from "@/Components/ui/sidebar";
import {AppSidebar} from "@/Components/dashboard/app-sidebar";
import {SiteHeader} from "@/Components/dashboard/site-header";
import {DataTable} from "@/Components/dashboard/data-table";
import Pagination from "@/Components/Pagination";
import {Paginate} from "@/types";


interface Post {
    id: number;
    title: string;
    slug: string;
    status: string;
    votes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        profile_photo_path: string | null;
        email: string;
    };
}


interface Props {
    data: Post[];
    pagination: Paginate;
}

export default function PostsPage({ data, pagination }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <DataTable data={data} />
                            {pagination && pagination.total > 0 && (
                                <div className="mt-5 sm:mt-6 md:mt-7 flex justify-center">
                                    <Pagination
                                        current_page={pagination.current_page}
                                        next_page_url={pagination.next_page_url}
                                        prev_page_url={pagination.prev_page_url}
                                        last_page={pagination.last_page}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
