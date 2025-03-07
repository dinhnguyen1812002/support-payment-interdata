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
    ? "inline-flex items-center px-4 py-2 text-base md:text-base font-bold text-blue-500 dark:bg-[#1B1C22]  bg-gray-100  rounded-lg " 
    : "inline-flex items-center px-5 py-2 text-base md:text-base font-bold text-customBlue text-foreground/80" 
    + " hover:text-blue-600 transition duration-150 ease-in-out";

    return (
      <Link  href={href} className={classes}>
        {children}
      </Link>
    );
  }
  