import { Link } from '@inertiajs/react';
import React, { PropsWithChildren } from 'react';

interface Props {
    href: string;
    active?: boolean;
}

export default function NavLink({
                                    active,
                                    href,
                                    children,
                                }: PropsWithChildren<Props>) {
    const classes = active
        ? 'inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-base md:text-lg font-medium leading-5 text-indigo-600 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out'
        : 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-base md:text-lg font-medium leading-5 text-black hover:text-indigo-600 hover:border-indigo-400 focus:outline-none focus:text-indigo-600 focus:border-indigo-400 transition duration-150 ease-in-out';
    return (
        <Link href={href} className={classes}>
            {children}
        </Link>
    );
}
