import React from 'react';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function AvatarDemo() {
  const testUsers = [
    { name: 'John Doe', src: null },
    { name: 'Jane Smith', src: null },
    { name: 'Bob Johnson', src: null },
    { name: 'Alice Brown', src: null },
    { name: 'Charlie Wilson', src: null },
    { name: 'Diana Prince', src: null },
  ];

  return (
    <AppLayout title="Avatar Demo" canLogin={false} canRegister={false} notifications={[]}>
      <Head title="Avatar Demo" />
      
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Avatar Fallback Demo</h1>
        
        {/* Geometric Variant */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Geometric Pattern</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {testUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={user.src}
                  name={user.name}
                  className="h-16 w-16"
                  variant="geometric"
                  size={64}
                />
                <span className="text-sm text-center">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Identicon Variant */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Identicon Pattern</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {testUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={user.src}
                  name={user.name}
                  className="h-16 w-16"
                  variant="identicon"
                  size={64}
                />
                <span className="text-sm text-center">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Initials Variant */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Initials</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {testUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={user.src}
                  name={user.name}
                  className="h-16 w-16"
                  variant="initials"
                  size={64}
                />
                <span className="text-sm text-center">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Square Variants */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Square Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {testUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={user.src}
                  name={user.name}
                  className="h-16 w-16"
                  variant={index === 0 ? "geometric" : index === 1 ? "identicon" : "initials"}
                  size={64}
                  square={true}
                />
                <span className="text-sm text-center">{user.name}</span>
                <span className="text-xs text-gray-500">
                  {index === 0 ? "Geometric" : index === 1 ? "Identicon" : "Initials"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Different Sizes */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Different Sizes</h2>
          <div className="flex items-end justify-center space-x-6">
            {[24, 32, 48, 64, 80, 96].map((size) => (
              <div key={size} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={null}
                  name="John Doe"
                  className={`h-${size/4} w-${size/4}`}
                  variant="geometric"
                  size={size}
                />
                <span className="text-xs text-gray-500">{size}px</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Custom Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {testUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <AvatarWithFallback
                  src={user.src}
                  name={user.name}
                  className="h-16 w-16"
                  variant="geometric"
                  size={64}
                  colors={
                    index === 0 
                      ? ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
                      : index === 1
                      ? ["#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#E17055"]
                      : ["#00B894", "#00CEC9", "#0984E3", "#6C5CE7", "#A29BFE"]
                  }
                />
                <span className="text-sm text-center">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
