import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {useRoute} from "ziggy-js";
import AppLayout from "@/Layouts/AppLayout";
import {Notification} from "@/types";
import {TechnologyCloud} from "@/Components/TechnologyCloud";


interface Props {
    canResetPassword: boolean;
    status: string;
    notifications: Notification[];
}

export default function Login({ canResetPassword, status, notifications }: Props) {
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

    return (
        <AppLayout title="Login" canLogin={true} canRegister={true} notifications={notifications}>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex h-full w-full max-w-5xl mx-auto shadow-lg rounded-2xl overflow-hidden">
                    {/* Left side - Image */}
                    <div className="hidden lg:flex lg:w-1/2 relative bg-background">
                        <TechnologyCloud/>
                    </div>
                    {/*<div className="hidden lg:block lg:w-1/2 relative">*/}
                    {/*    /!* Overlay with text *!/*/}
                    {/*    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">*/}
                    {/*        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>*/}
                    {/*        <p className="text-sm opacity-90">Sign in to continue your journey with us.</p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Right side - Login Form */}
                    <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12">
                        <div className="max-w-sm mx-auto">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
                                <p className="text-sm text-gray-600 mt-2">
                                    Enter your credentials to continue
                                </p>
                            </div>

                            {status && (
                                <Alert className="mb-6">
                                    <AlertDescription>{status}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-2">
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

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={e => form.setData('password',  e.currentTarget.value)}
                                        required
                                        className="h-10"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
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
                                    className={`w-full h-11 ${form.processing ? 'opacity-50' : ''}`}
                                >
                                    Sign in
                                </Button>

                                <div className="text-center text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-sm"
                                        asChild
                                    >
                                        <Link href={route('register')}>
                                            Create account
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
