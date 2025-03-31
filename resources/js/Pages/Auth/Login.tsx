import React, { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { useRoute } from 'ziggy-js';
import { Notification } from '@/types';
import { Eye, EyeClosed, GalleryVerticalEnd } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/Components/ui/checkbox';
import { Particles } from '@/Components/particles';
import { useTheme } from 'next-themes';

interface Props {
    canResetPassword: boolean;
    status: string;
    notifications: Notification[];
}

export default function Login({ canResetPassword, status, notifications }: Props) {
    const { resolvedTheme } = useTheme();
    const [color, setColor] = useState('#ffffff');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const route = useRoute();
    const form = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        setColor(resolvedTheme === 'dark' ? '#ffffff' : '#000000');
    }, [resolvedTheme]);

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('login'), {
            onFinish: () => form.reset('password'),
        });
    }

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
            // Verify the origin for security
            if (event.origin !== window.location.origin) return;

            const { success, token, error } = event.data;
            if (success && token) {
                console.log(`${provider} login successful, token:`, token);
                // Redirect to "/" after successful login
                window.location.href = '/';
            } else if (error) {
                console.error(`${provider} login failed:`, error);
                // Optionally show an error message to the user
            }
            popup?.close(); // Ensure popup closes even on error
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
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Support ticket
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form className={cn('flex flex-col gap-6')} onSubmit={onSubmit}>
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
                                        onChange={(e) => form.setData('email', e.currentTarget.value)}
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
                                            type={passwordVisible ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.currentTarget.value)}
                                            className="h-10 pr-10"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {passwordVisible ? (
                                                <EyeClosed className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
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
                                        <Button variant="link" className="p-0 h-auto text-sm" asChild>
                                            <Link href={route('password.request')}>Forgot password?</Link>
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className={`w-full ${form.processing ? 'opacity-50' : ''}`}
                                >
                                    Login
                                </Button>
                                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSocialLogin('github')}
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                                        <path
                                            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Login with GitHub
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSocialLogin('google')}
                                    type="button"
                                >
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
                                    Login with Google
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don't have an account?{' '}
                                <Link href={route('register')}>Create account</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="relative hidden h-full w-full bg-muted lg:block">
                <Particles className="absolute inset-0 z-0" quantity={100} ease={80} color={color} refresh />
            </div>
        </div>
    );
}
