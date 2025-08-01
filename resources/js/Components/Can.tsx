import * as React from 'react';
import { createContextualCan } from '@casl/react';
import { createContext } from 'react';
import { AppAbility } from '../Utils/ability';

// Create a context for the ability
export const AbilityContext = createContext<AppAbility>(null as unknown as AppAbility);

// Create a custom Can component that uses the ability context
const Can = createContextualCan(AbilityContext.Consumer);

export default Can;

// Import CASL types
import { Actions, Subjects } from '../Utils/ability';

// Type for the Can component props
export type CanProps = {
  I: Actions;
  a: Subjects;
  children: React.ReactNode;
  passThrough?: boolean;
  field?: string;
  [key: string]: any; // Allow additional props
};

// Helper component to check permissions
export const CanComponent: React.FC<CanProps> = ({
  I,
  a: action,
  children,
  passThrough = false,
  field,
  ...props
}) => {
  return (
    <Can I={I} a={action} passThrough={passThrough} field={field} {...props}>
      {children}
    </Can>
  );
};
