import React from 'react';
import { Button, ButtonProps } from '@/Components/ui/button';
import { Can } from '@/Context/AbilityContext';
import { Actions, Subjects } from '@/Utils/ability';

interface PermissionButtonProps extends ButtonProps {
  action: Actions;
  subject: Subjects;
  matchingConditions?: Record<string, any>;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  action,
  subject,
  matchingConditions,
  children,
  ...props
}) => {
  return (
    <Can I={action} a={subject} {...matchingConditions} passThrough>
      {(allowed) => (
        <Button
          {...props}
          disabled={!allowed || props.disabled}
          onClick={allowed ? props.onClick : undefined}
        >
          {children}
        </Button>
      )}
    </Can>
  );
};