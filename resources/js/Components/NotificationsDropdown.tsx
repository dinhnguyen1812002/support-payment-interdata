import React from 'react';
import { BellRing, Check, Bell } from "lucide-react";
import { Link } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Button } from "@/Components/ui/button";
import {Notification} from "@/types";



interface NotificationsDropdownProps {
    notifications: Notification[];
    className?: string;
}

const NotificationsDropdown = ({
                                   notifications,
                                   className
                               }: NotificationsDropdownProps) => {
    const [isPushEnabled, setIsPushEnabled] = React.useState(false);
    const unreadCount = notifications.filter(n => !n.data.message).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px]">
                <Card className={cn("w-full border-0 shadow-none", className)}>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>You have {unreadCount} unread messages.</CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-4">
                        {/*<div className="flex items-center space-x-4 rounded-md border p-4">*/}
                        {/*    <BellRing className="h-5 w-5" />*/}
                        {/*    <div className="flex-1 space-y-1">*/}
                        {/*        <p className="text-sm font-medium leading-none">*/}
                        {/*            Push Notifications*/}
                        {/*        </p>*/}
                        {/*        <p className="text-sm text-muted-foreground">*/}
                        {/*            Send notifications to device.*/}
                        {/*        </p>*/}
                        {/*    </div>*/}
                        {/*    <Switch*/}
                        {/*        checked={isPushEnabled}*/}
                        {/*        onCheckedChange={setIsPushEnabled}*/}
                        {/*    />*/}
                        {/*</div>*/}

                        <div>
                            {notifications.map((notification, index) => (
                                <div
                                    key={index}
                                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                                >
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                    <div className="space-y-1">
                                        {notification.data.url ? (
                                            <Link href={notification.data.url} className="block">
                                                <p className="text-sm font-medium leading-none">
                                                    {notification.data.message}
                                                </p>
                                                {/*<p className="text-sm text-muted-foreground">*/}
                                                {/*    {notification.description}*/}
                                                {/*</p>*/}
                                            </Link>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium leading-none">
                                                    {notification.data.message}
                                                </p>
                                                {/*<p className="text-sm text-muted-foreground">*/}
                                                {/*    {notification.description}*/}
                                                {/*</p>*/}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button className="w-full">
                            <Check className="mr-2 h-4 w-4" /> Mark all as read
                        </Button>
                    </CardFooter>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationsDropdown;
