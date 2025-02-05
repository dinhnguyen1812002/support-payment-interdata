import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import {
    UserCircle,
    Lock,
    Activity,
    Bell as BellIcon,
    UserX,
    ChevronRight,
    FileText
} from 'lucide-react';

import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import {Notification, Post, Session} from '@/types';
import PostsTable from "@/Pages/Profile/Partials/PostTable";
import { router } from '@inertiajs/core';
import {route} from "ziggy-js";
// interface Post {
//     id: number;
//     title: string;
//     created_at: string;
//     is_public: boolean;
//     comments_count: number;
//     slug: string;
// }
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
}

const SidebarItem = ({ icon, title, isActive, onClick }: SidebarItemProps) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start gap-2 h-12",
            isActive && "bg-muted font-medium"
        )}
        onClick={onClick}
    >
        {icon}
        <span>{title}</span>
        {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
    </Button>
);

const ProfilePage = ({
                         sessions,
                         confirmsTwoFactorAuthentication,
                         posts,
                         categories,
                         postCount,
                         pagination,
                         keyword = '',
    notifications
                     }: Props) => {
    const page = useTypedPage();
    // const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeSection, setActiveSection] = useState('profile');
    const user = page.props.auth.user!;

    const handleSearch = (searchKeyword: string) => {
        router.get(
            route('profile.show'),
            { search: searchKeyword },
            { preserveState: true }
        );
    };

    const handlePageChange = (pageNumber: number) => {
        router.get(
            route('profile.show'),
            { page: pageNumber, search: keyword },
            { preserveState: true }
        );
    };

    const sidebarItems = [
        {
            id: 'profile',
            title: 'Profile Information',
            icon: <UserCircle className="w-5 h-5" />,
            component: <UpdateProfileInformationForm user={user} />
        },
        {
            id: 'security',
            title: 'Security Settings',
            icon: <Lock className="w-5 h-5" />,
            component: (
                <div className="space-y-6">
                    <UpdatePasswordForm />
                    {page.props.jetstream.canManageTwoFactorAuthentication && (
                        <TwoFactorAuthenticationForm
                            requiresConfirmation={confirmsTwoFactorAuthentication}
                        />
                    )}
                </div>
            )
        },
        {
            id: 'sessions',
            title: 'Active Sessions',
            icon: <Activity className="w-5 h-5" />,
            component: <LogoutOtherBrowserSessions sessions={sessions} />
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <BellIcon className="w-5 h-5" />,
            component: (
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                            Manage how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Add notification settings here */}
                    </CardContent>
                </Card>
            )
        },
        {
            id: 'posts',
            title: 'Your Questions',
            icon: <FileText className="h-5 w-5" />,
            component: (
                <PostsTable
                    posts={{data:posts}}
                    pagination={pagination}
                    keyword={keyword}
                />
            )
        }
    ];

    return (
        <AppLayout
            notifications={notifications}
            canRegister={true}
            canLogin={true}
            title={user.name}
        >
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <div className="w-64 border-r bg-background">
                    <div className="flex items-center px-4 h-14 border-b">
                        <h2 className="text-lg font-semibold">Settings</h2>
                    </div>
                    <ScrollArea className="h-[calc(100vh-8rem)]">
                        <div className="p-3 space-y-1">
                            {sidebarItems.map((item) => (
                                <SidebarItem
                                    key={item.id}
                                    icon={item.icon}
                                    title={item.title}
                                    isActive={activeSection === item.id}
                                    onClick={() => setActiveSection(item.id)}
                                />
                            ))}
                            {page.props.jetstream.hasAccountDeletionFeatures && (
                                <>
                                    <Separator className="my-2" />
                                    <SidebarItem
                                        icon={<UserX className="w-5 h-5 text-destructive" />}
                                        title="Delete Account"
                                        isActive={activeSection === 'delete'}
                                        onClick={() => setActiveSection('delete')}
                                    />
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Content */}
                <div className="overflow-y-auto flex-1">
                    <div className="flex items-center px-6 h-14 ">
                        <h1 className="text-lg font-semibold">
                            {sidebarItems.find(item => item.id === activeSection)?.title || 'Delete Account'}
                        </h1>
                    </div>
                    <div className="p-6">
                        {activeSection === 'delete'
                            ? <DeleteUserForm />
                            : sidebarItems.find(item => item.id === activeSection)?.component
                        }
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfilePage;
