import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';

interface AuthButtonsProps {
  canLogin: boolean;
  canRegister: boolean;
}

export default function AuthButtons({ canLogin, canRegister }: AuthButtonsProps) {
  const route = useRoute();

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {canLogin && (
        <Button
          variant="ghost"
          asChild
          size="sm"
          className="text-xs sm:text-sm px-2 sm:px-3 h-8"
        >
          <Link href={route('login')}>Log in</Link>
        </Button>
      )}
      {canRegister && (
        <Button
          asChild
          size="sm"
          className="text-xs sm:text-sm px-2 sm:px-3 h-8"
        >
          <Link href={route('register')}>Register</Link>
        </Button>
      )}
    </div>
  );
}
