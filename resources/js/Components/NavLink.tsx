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
    ? "inline-flex items-center px-2 sm:px-3 lg:px-4 py-2 text-sm lg:text-base font-semibold dark:bg-[#1B1C22] bg-gray-100 rounded-lg transition-all duration-200"
    : "inline-flex items-center px-2 sm:px-3 lg:px-4 py-2 text-sm lg:text-base font-semibold text-foreground/80 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
    ;

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  