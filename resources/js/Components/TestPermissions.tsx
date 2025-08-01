import React from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from './ui/button';
import Can from './Can';

export const TestPermissions: React.FC = () => {
  const { auth } = usePage().props as any;
  const user = auth?.user;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4">Test Permissions</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Current User:</h3>
          <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
            {JSON.stringify({
              name: user?.name,
              email: user?.email,
              roles: user?.roles?.map((r: any) => r.name) || [],
              permissions: user?.permissions?.map((p: any) => p.name) || []
            }, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Permission Tests:</h3>
          
          <div className="flex items-center space-x-2">
            <Can I="create" a="Post">
              <Button variant="outline">Create Post</Button>
            </Can>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Can create posts
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Can I="update" a="Post">
              <Button variant="outline">Edit Post</Button>
            </Can>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Can edit posts
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Can I="delete" a="Post">
              <Button variant="outline">Delete Post</Button>
            </Can>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Can delete posts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPermissions;
