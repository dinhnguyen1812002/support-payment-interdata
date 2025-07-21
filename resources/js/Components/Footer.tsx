import React from 'react';
import { Link } from '@inertiajs/react';
import { Github, Twitter, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-5 flex w-full max-w-[1450px] mx-auto sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 dark:bg-[#0F1014]  lg:pl-8 xl:pl-12 sticky">
      <div className="container px-4 py-8 mx-auto">
        {/* Copyright */}
        <div className="flex flex-col justify-between items-center space-y-4 md:flex-row md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Inter Group. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
