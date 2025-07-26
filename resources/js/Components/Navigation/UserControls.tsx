import React from 'react';
import SearchButton from './SearchButton';
import UserMenu from './UserMenu';
import AuthButtons from './AuthButtons';
import NotificationsDropdown from '@/Components/notification/Notifications';
import useTypedPage from '@/Hooks/useTypedPage';

interface UserControlsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleCategoryClick: () => void;
  notifications: any[];
  canLogin: boolean;
  canRegister: boolean;
  logout: (e: React.FormEvent) => void;
}

export default function UserControls({
  open,
  setOpen,
  handleCategoryClick,
  notifications,
  canLogin,
  canRegister,
  logout,
}: UserControlsProps) {
  const page = useTypedPage();

  return (
    <>
      {/* Search Button */}
      <SearchButton
        open={open}
        setOpen={setOpen}
        handleCategoryClick={handleCategoryClick}
      />
      
      {/* Notifications - Only show for authenticated users */}
      {page.props.auth.user && (
        <NotificationsDropdown notifications={notifications} />
      )}
  
      {/* User Menu or Login/Register buttons */}
      {page.props.auth.user ? (
        <UserMenu logout={logout} />
      ) : (
        <AuthButtons canLogin={canLogin} canRegister={canRegister} />
      )}
    </>
  );
}
