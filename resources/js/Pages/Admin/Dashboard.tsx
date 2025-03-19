import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/Components/ui/sidebar"

import React from "react"
import PostsTable from "@/Pages/Profile/Partials/PostTable";
import {Notification, Post, Session} from "@/types";

interface Props {
    sessions: Session[];
    confirmsTwoFactorAuthentication: boolean;
    posts: Post[];
    categories: any[];
    postCount: number;
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    keyword?: string;
    notifications: Notification[];
}

interface SidebarItemProps {
    icon: React.ReactNode;
    title: string;
    isActive: boolean;
    onClick: () => void;
    variant?: "default" | "destructive";
}

// export default function Page()=>({}) {
//     return (
//         <SidebarProvider>
//             <AppSidebar variant="inset" />
//             <SidebarInset>
//                 <SiteHeader />
//                 <div className="flex flex-1 flex-col">
//                     <div className="@container/main flex flex-1 flex-col gap-2">
//                         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//                             <SectionCards />
//                             <div className="px-4 lg:px-6">
//                                 <ChartAreaInteractive />
//                             </div>
//                             <PostsTable
//                                 posts={{data:posts}}
//                                 pagination={pagination}
//                                 keyword={keyword}
//                             />
//                             )
//                         </div>
//                     </div>
//                 </div>
//             </SidebarInset>
//         </SidebarProvider>
//     )
// }
const ProfilePage = ({
                         posts,
                         pagination,
                         keyword = '',
                     }: Props) => {
    return (

        <SidebarProvider>
                        <AppSidebar variant="inset" />
                        <SidebarInset>
                            <SiteHeader />
                            <div className="flex flex-1 flex-col">
                                <div className="@container/main flex flex-1 flex-col gap-2">
                                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                        <SectionCards />
                                        <div className="px-4 lg:px-6">
                                            <ChartAreaInteractive />
                                        </div>
                                        <PostsTable
                                            posts={{data:posts}}
                                            pagination={pagination}
                                            keyword={keyword}
                                        />
                                        )
                                    </div>
                                </div>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
    );

}
