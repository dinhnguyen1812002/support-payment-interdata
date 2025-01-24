import React from 'react';
import APITokenManager from '@/Pages/API/Partials/APITokenManager';
import AppLayout from '@/Layouts/AppLayout';
import {ApiToken, Notification} from '@/types';

interface Props {
  tokens: ApiToken[];
  availablePermissions: string[];
  defaultPermissions: string[];
  notifications: Notification[];
}

export default function ApiTokenIndex({
  tokens,
  availablePermissions,
  defaultPermissions,
  notifications
}: Props) {
  return (
    <AppLayout
        canRegister={true}
        canLogin={true}
      title={'API Tokens'}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          API Tokens
        </h2>
      )}
     notifications={notifications}>
      <div>
        <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
          <APITokenManager
            tokens={tokens}
            availablePermissions={availablePermissions}
            defaultPermissions={defaultPermissions}
          />
        </div>
      </div>
    </AppLayout>
  );
}
