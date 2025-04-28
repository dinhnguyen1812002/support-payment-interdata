import React from 'react';


import { Button } from '@/Components/ui/button';
import { UserCircle } from 'lucide-react';
import  SidebarNav  from './sidebar-nav';

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {

    return (
        <div className="flex  flex-col dark:bg-[#0F1014]">
            <div className="flex flex-1 mt-3">
                {/* Sidebar cố định chiều rộng */}
                <aside className="hidden md:block ">
                    <SidebarNav title={title} />
                </aside>

                {/* Main content chiếm phần còn lại */}
                <main className="flex-1 w-full ">
                    {children}
                </main>
            </div>
        </div>
    );
}
