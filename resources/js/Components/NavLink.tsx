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
        ? "inline-flex items-center px-2 pt-1 text-base md:text-lg font-medium text-indigo-600 transition duration-150 ease-in-out "
        : "inline-flex items-center px-2 pt-1 text-base md:text-lg font-medium text-black hover:text-indigo-600 transition duration-150 ease-in-out";

    return (
        <Link href={href} className={classes}>
            {children}
        </Link>
    );
}
