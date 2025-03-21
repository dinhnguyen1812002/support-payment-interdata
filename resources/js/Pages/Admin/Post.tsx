import React, { useState } from "react";
import { DataTable } from "@/Components/dashboard/Post/data-table";
import { columns } from "@/Components/dashboard/Post/columns";
import { usePage } from "@inertiajs/react";
import {SidebarInset, SidebarProvider} from "@/Components/ui/sidebar";
import {AppSidebar} from "@/Components/dashboard/app-sidebar";
import {SiteHeader} from "@/Components/dashboard/site-header";
import {SectionCards} from "@/Components/dashboard/section-cards";
import {Inertia} from "@inertiajs/inertia";

export type Post = {
    id: string;
    title: string;
    slug: string
    status: "published" | "private";
    votes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
    };
};

// Định nghĩa type cho pagination
type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export default function PostsPage() {
    const { props } = usePage();
    const initialData = props.data as Post[];
    const initialPagination = props.pagination as Pagination;

    // Sử dụng state để quản lý data và pagination
    const [data, setData] = useState(initialData);
    const [pagination, setPagination] = useState(initialPagination);

    // Hàm xử lý chuyển trang
    const handlePageChange = (url: string | null) => {
        if (url) {
            Inertia.visit(url, {
                preserveState: true,
                preserveScroll: true,
                only: ['data', 'pagination'], // Chỉ cập nhật data và pagination
                onSuccess: (page) => {
                    // Cập nhật state với dữ liệu mới từ server
                    setData(page.props.data as Post[]);
                    setPagination(page.props.pagination as Pagination);
                },
            });
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 ml-4">

                            <DataTable
                                columns={columns}
                                data={data}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
