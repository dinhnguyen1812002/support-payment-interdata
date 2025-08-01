import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { createMongoAbility } from '@casl/ability';
import { AppAbility, defineRulesFor } from '../Utils/ability';
import { User } from '../types/Role';

// Create a context with a default empty ability
export const AbilityContext = createContext<AppAbility | null>(null);

interface AbilityProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ 
  children, 
  initialUser = null 
}) => {
  const [ability] = useState<AppAbility>(() => defineRulesFor(initialUser));
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(initialUser);

  // Update ability when user changes
  useEffect(() => {
    if (currentUser !== initialUser) {
      const newAbility = defineRulesFor(initialUser || null);
      ability.update(newAbility.rules);
      setCurrentUser(initialUser);
    }
  }, [initialUser, currentUser, ability]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

export const useAbility = () => {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  return ability;
};

export default AbilityProvider;
