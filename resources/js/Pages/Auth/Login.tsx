import React, { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

import { useRoute } from "ziggy-js";

import { Notification } from "@/types";
import { Eye, EyeClosed, EyeOff, GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/Components/ui/checkbox";
import { Particles } from "@/Components/particles";
import { useTheme } from "next-themes";

interface Props {
    canResetPassword: boolean;
    status: string;
    notifications: Notification[];
}

export default function Login({ canResetPassword, status, notifications }: Props) {
    const { resolvedTheme } = useTheme()
    const [color, setColor] = useState("#ffffff");
    const [passwordVisible, setPasswordVisible] = useState(false);
    // const [color, setColor] = useState("#ffffff");
    const route = useRoute();
    const form = useForm({
        email: '',
        password: '',
        remember: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('login'), {
            onFinish: () => form.reset('password'),
        });
    }
    useEffect(() => {
        setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000")
    }, [resolvedTheme])


    const togglePasswordVisibility = () => {
        setPasswordVisible(prev => !prev);
    };
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Support ticket
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form className={cn("flex flex-col gap-6")} onSubmit={onSubmit} >
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Login to your account</h1>
                                <p className="text-balance text-sm text-muted-foreground">
                                    Enter your email below to login to your account
                                </p>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.currentTarget.value)}
                                        required
                                        autoFocus
                                        className="h-10"
                                        placeholder="Enter your email"
                                    />
                                    {form.errors.email && (
                                        <p className="text-sm text-destructive">{form.errors.email}</p>
                                    )}

                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={passwordVisible ? "text" : "password"}
                                            value={form.data.password}
                                            onChange={e => form.setData("password", e.currentTarget.value)}
                                            required
                                            className="h-10 pr-10"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
              
                                            {passwordVisible ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {form.errors.password && (
                                        <p className="text-sm text-destructive">{form.errors.password}</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={form.data.remember === 'on'}
                                            onCheckedChange={(checked) =>
                                                form.setData('remember', checked ? 'on' : '')
                                            }
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-600">
                                            Remember me
                                        </Label>
                                    </div>

                                    {canResetPassword && (
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-sm"
                                            asChild
                                        >
                                            <Link href={route('password.request')}>
                                                Forgot password?
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className={ `w-full  ${form.processing ? 'opacity-50' : ''}`}
                                >
                                    Login
                                </Button>
                                <div
                                    className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                                <Button variant="outline" className="w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Login with GitHub
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                {/*<a href="#" className="underline underline-offset-4">*/}
                                {/*    Sign up*/}
                                {/*</a>*/}
                                <Link href={route('register')}>
                                    Create account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="relative hidden h-full w-full bg-muted lg:block">
                {/*<img*/}
                {/*    src="/storage/assets/develop.jpg"*/}
                {/*    alt="Image"*/}
                {/*    className="absolute inset-0 h-full w-full object-cover"*/}
                {/*/>*/}
                {/*<Particles*/}
                {/*    className="absolute inset-0 z-0"*/}
                {/*    quantity={100}*/}
                {/*    ease={80}*/}
                {/*    color={color}*/}
                {/*    refresh*/}
                {/*/>*/}
                <Particles className="absolute inset-0 z-0" quantity={100} ease={80} color={color} refresh />

            </div>
        </div>
    )
}
