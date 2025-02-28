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

                            {/*<div className="relative my-6">*/}
                            {/*    <div className="absolute inset-0 flex items-center">*/}
                            {/*        <span className="w-full border-t"/>*/}
                            {/*    </div>*/}
                            {/*    <div className="relative flex justify-center text-xs uppercase">*/}
                            {/*        <span className="bg-white px-2 text-muted-foreground">*/}
                            {/*        Hoặc đăng ký bằng*/}
                            {/*        </span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/*<div className="grid grid-cols-2 gap-4">*/}
                            {/*    <Button variant="outline" className="w-full">*/}
                            {/*        /!*<Icons.gitHub className="mr-2 h-4 w-4" />*!/*/}
                            {/*        GitHub*/}
                            {/*    </Button>*/}
                            {/*    <Button variant="outline" className="w-full">*/}
                            {/*        /!*<Icons.google className="mr-2 h-4 w-4" />*!/*/}
                            {/*        Google*/}
                            {/*    </Button>*/}
                            {/*</div>*/}

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
