import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

import {
  UserCircle,
  Lock,
  Activity,
  FileText,
  UserX,
  Shield,
} from 'lucide-react';

import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import { Notification, Post, Session } from '@/types';
import PostsTable from '@/Pages/Profile/Partials/PostTable';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Toaster } from '@/Components/ui/sonner';

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

const ProfilePage = ({
  sessions,
  confirmsTwoFactorAuthentication,
  posts,
  categories,
  postCount,
  pagination,
  keyword = '',
  notifications,
}: Props) => {
  const page = useTypedPage();
  const user = page.props.auth.user!;

  const handleSearch = (searchKeyword: string) => {
    router.get(
      route('profile.show'),
      { search: searchKeyword },
      { preserveState: true },
    );
  };

  const handlePageChange = (pageNumber: number) => {
    router.get(
      route('profile.show'),
      { page: pageNumber, search: keyword },
      { preserveState: true },
    );
  };

  return (
    <AppLayout
      notifications={notifications}
      canRegister={true}
      canLogin={true}
      title={user.name}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.profile_photo_url}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.email}</span> 
                 
                 
                </div>
                {/* <Badge variant="outline">{user.roles[0].name}</Badge> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account's profile information and email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateProfileInformationForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdatePasswordForm />
              </CardContent>
            </Card>

            {page.props.jetstream.canManageTwoFactorAuthentication && (
              <Card>
                <CardHeader>
                  <CardTitle>Two Factor Authentication</CardTitle>
                  <CardDescription>
                    Add additional security to your account using two factor authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TwoFactorAuthenticationForm requiresConfirmation={confirmsTwoFactorAuthentication} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Browser Sessions</CardTitle>
                <CardDescription>
                  Manage and log out your active sessions on other browsers and devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogoutOtherBrowserSessions sessions={sessions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets and Features Requests</CardTitle>
                <CardDescription>
                  View and manage your tickets and features requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PostsTable
                  posts={{ data: posts }}
                  pagination={pagination}
                  keyword={keyword}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {page.props.jetstream.hasAccountDeletionFeatures && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all of its data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteUserForm />
            </CardContent>
          </Card>
        )}
      </div>

      <Toaster expand={true} closeButton />

    </AppLayout>
  );
};

export default ProfilePage;
