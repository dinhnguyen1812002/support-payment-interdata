import React, {useEffect, useState} from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import AppLayout from "@/Layouts/AppLayout";
import {GalleryVerticalEnd, LoaderCircle} from "lucide-react";
import {Particles} from "@/Components/particles";
import {useTheme} from "next-themes";


export default function Register() {

    const  {theme} = useTheme()

    const  [color, setColor] = useState('#ffffff');

    const page = useTypedPage();
    const route = useRoute();
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const notifications:any[] =  [];
    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('register'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }
    useEffect(() => {
        setColor(theme === 'dark' ? '#ffffff' : '#000000')
    },  [theme]);
    const handleSocialLogin = (provider: 'google' | 'github') => {
        const width = 600;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            route(`auth.${provider}`),
            `${provider}-login`,
            `width=${width},height=${height},top=${top},left=${left}`
        );

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const { success, token, error } = event.data;
            if (success && token) {
                console.log(`OAuth login successful, token:`, token);
                localStorage.setItem('authToken', token); // Lưu token nếu cần
                window.location.href = '/'; // Chuyển hướng sau khi login thành công
            } else if (error) {
                console.error(`OAuth login failed:`, error);
                alert('Login failed. Please try again.');
            }

            popup?.close();
            window.removeEventListener('message', handleMessage);
        };

        window.addEventListener('message', handleMessage);

        // Cleanup listener if popup is closed manually
        const checkPopupClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', handleMessage);
            }
        }, 500);
    };
    return (

        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4"/>
                        </div>
                        Support ticket
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">Create Account</h2>
                            <p className="text-muted-foreground mt-2">
                                Enter your details to get started
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.currentTarget.value)}
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={form.data.email}
                                    onChange={e => form.setData('email', e.currentTarget.value)}
                                    required
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
                                    onChange={e => form.setData('password', e.currentTarget.value)}
                                    required
                                    autoComplete="new-password"
                                />
                                {form.errors.password && (
                                    <p className="text-sm text-destructive">{form.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={e =>
                                        form.setData('password_confirmation', e.currentTarget.value)
                                    }
                                    required
                                    autoComplete="new-password"
                                />
                                {form.errors.password_confirmation && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {page.props.jetstream.hasTermsAndPrivacyPolicyFeature && (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="terms"
                                            checked={form.data.terms}
                                            onCheckedChange={(checked) =>
                                                form.setData('terms', checked as boolean)
                                            }
                                            required
                                        />
                                        <Label htmlFor="terms" className="text-sm text-muted-foreground">
                                            I agree to the{' '}
                                            <Link
                                                href={route('terms.show')}
                                                className="text-primary hover:underline"
                                                target="_blank"
                                            >
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                href={route('policy.show')}
                                                className="text-primary hover:underline"
                                                target="_blank"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                    </div>
                                    {form.errors.terms && (
                                        <p className="text-sm text-destructive">{form.errors.terms}</p>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {form.processing ? (
                                    <LoaderCircle className="mr-2 h-4 w-4"/>

                                ) : null}
                                Create account
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t"/>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">
                                        or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('github')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                                        <path
                                            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    GitHub
                                </Button>
                                <Button variant="outline" className="w-full" onClick={()=>handleSocialLogin('google')} >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 50 50"
                                        className="w-5 h-5 mr-2"
                                    >
                                        <path
                                            d="M 26 2 C 13.308594 2 3 12.308594 3 25 C 3 37.691406 13.308594 48 26 48 C 35.917969 48 41.972656 43.4375 45.125 37.78125 C 48.277344 32.125 48.675781 25.480469 47.71875 20.9375 L 47.53125 20.15625 L 46.75 20.15625 L 26 20.125 L 25 20.125 L 25 30.53125 L 36.4375 30.53125 C 34.710938 34.53125 31.195313 37.28125 26 37.28125 C 19.210938 37.28125 13.71875 31.789063 13.71875 25 C 13.71875 18.210938 19.210938 12.71875 26 12.71875 C 29.050781 12.71875 31.820313 13.847656 33.96875 15.6875 L 34.6875 16.28125 L 41.53125 9.4375 L 42.25 8.6875 L 41.5 8 C 37.414063 4.277344 31.960938 2 26 2 Z M 26 4 C 31.074219 4 35.652344 5.855469 39.28125 8.84375 L 34.46875 13.65625 C 32.089844 11.878906 29.199219 10.71875 26 10.71875 C 18.128906 10.71875 11.71875 17.128906 11.71875 25 C 11.71875 32.871094 18.128906 39.28125 26 39.28125 C 32.550781 39.28125 37.261719 35.265625 38.9375 29.8125 L 39.34375 28.53125 L 27 28.53125 L 27 22.125 L 45.84375 22.15625 C 46.507813 26.191406 46.066406 31.984375 43.375 36.8125 C 40.515625 41.9375 35.320313 46 26 46 C 14.386719 46 5 36.609375 5 25 C 5 13.390625 14.386719 4 26 4 Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Google
                                </Button>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                Bạn đã đăng ký?{' '}
                                <Button variant="link" className="px-0" asChild>
                                    <Link href={route('login')}>Sign in</Link>
                                </Button>
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
    );
}
