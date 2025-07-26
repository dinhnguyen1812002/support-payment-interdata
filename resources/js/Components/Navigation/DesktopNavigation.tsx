import React from 'react';
import NavLink from '@/Components/NavLink';
import useRoute from '@/Hooks/useRoute';

interface DesktopNavigationProps {
  role: string;
  department: any;
}

export default function DesktopNavigation({ role, department }: DesktopNavigationProps) {
  const route = useRoute();

  return (
    <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-auto">
      <div className="flex space-x-1 lg:space-x-4">
        <NavLink 
          href={route('/')} 
          active={route().current('/')}
        >
          Home
        </NavLink>
        <NavLink 
          href={route('all')} 
          active={route().current('all')}
        >
          Tickets
        </NavLink>
        {role === 'admin' && (
          <NavLink
            href={route('admin.dashboard')}
            active={route().current('admin.dashboard')}
          >
            Dashboard
          </NavLink>
        )}
        {department && (
          <NavLink
            href={route('departments.show', {
              department: department.slug,
            })}
            active={route().current('departments.show', {
              department: department.slug,
            })}
          >
            <span className="truncate max-w-[120px] block" title={department.name}>
              {department.name}
            </span>
          </NavLink>
        )}
      </div>
    </div>
  );
}
