import React, { createContext, useContext, useEffect, useState } from 'react';
import { createContextualCan } from '@casl/react';
import defaultAbility, { AppAbility, defineRulesFor } from '@/Utils/ability';
import { User } from '@/types/Role';
import useTypedPage from '@/Hooks/useTypedPage';

// Tạo context để lưu trữ ability
const AbilityContext = createContext<AppAbility>(defaultAbility);

// Hook để sử dụng ability
export const useAbility = () => useContext(AbilityContext);

// Component Can để kiểm tra quyền
export const Can = createContextualCan(AbilityContext.Consumer);

// Provider để cung cấp ability cho toàn bộ ứng dụng
export const AbilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useTypedPage().props;
  const [ability, setAbility] = useState<AppAbility>(defaultAbility);

  useEffect(() => {
    if (auth.user) {
      // Tạo ability mới dựa trên user hiện tại
      const newAbility = defineRulesFor(auth.user as unknown as User);
      setAbility(newAbility);
    } else {
      // Reset về ability mặc định nếu không có user
      setAbility(defaultAbility);
    }
  }, [auth.user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};