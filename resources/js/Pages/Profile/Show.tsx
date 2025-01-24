import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import { Shield, Key, Smartphone, LogOut, UserX } from 'lucide-react';

import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import { Notification, Session } from '@/types';

interface Props {
    sessions: Session[];
    confirmsTwoFactorAuthentication: boolean;
    notifications: Notification[];
}

const ProfilePage = ({
                         sessions,
                         confirmsTwoFactorAuthentication,
                         notifications
                     }: Props) => {
    const page = useTypedPage();

    return (
        <AppLayout
            notifications={notifications}
            canRegister={true}
            canLogin={true}
            title="Profile"
        >
            <div className="container mx-auto py-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profile" className="w-full">
                            <ScrollArea className="w-full">
                                <TabsList className="w-full justify-start border-b mb-4">
                                    {page.props.jetstream.canUpdateProfileInformation && (
                                        <TabsTrigger value="profile" className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Profile Information
                                        </TabsTrigger>
                                    )}
                                    {page.props.jetstream.canUpdatePassword && (
                                        <TabsTrigger value="password" className="flex items-center gap-2">
                                            <Key className="w-4 h-4" />
                                            Password
                                        </TabsTrigger>
                                    )}
                                    {page.props.jetstream.canManageTwoFactorAuthentication && (
                                        <TabsTrigger value="2fa" className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            Two-Factor Auth
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger value="sessions" className="flex items-center gap-2">
                                        <LogOut className="w-4 h-4" />
                                        Browser Sessions
                                    </TabsTrigger>
                                    {page.props.jetstream.hasAccountDeletionFeatures && (
                                        <TabsTrigger value="delete" className="flex items-center gap-2">
                                            <UserX className="w-4 h-4" />
                                            Delete Account
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </ScrollArea>

                            {page.props.jetstream.canUpdateProfileInformation && (
                                <TabsContent value="profile" className="mt-4">
                                    <UpdateProfileInformationForm user={page.props.auth.user!} />
                                </TabsContent>
                            )}

                            {page.props.jetstream.canUpdatePassword && (
                                <TabsContent value="password" className="mt-4">
                                    <UpdatePasswordForm />
                                </TabsContent>
                            )}

                            {page.props.jetstream.canManageTwoFactorAuthentication && (
                                <TabsContent value="2fa" className="mt-4">
                                    <TwoFactorAuthenticationForm
                                        requiresConfirmation={confirmsTwoFactorAuthentication}
                                    />
                                </TabsContent>
                            )}

                            <TabsContent value="sessions" className="mt-4">
                                <LogoutOtherBrowserSessions sessions={sessions} />
                            </TabsContent>

                            {page.props.jetstream.hasAccountDeletionFeatures && (
                                <TabsContent value="delete" className="mt-4">
                                    <DeleteUserForm />
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ProfilePage;
