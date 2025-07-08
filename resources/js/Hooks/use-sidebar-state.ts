import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STATE_KEY = 'sidebar-state';
const SIDEBAR_ITEMS_STATE_KEY = 'sidebar-items-state';

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
}

interface SidebarItemsState {
  [itemKey: string]: boolean;
}

// Hook để quản lý state chính của sidebar (mở/đóng)
export function useSidebarState(defaultOpen: boolean = true) {
  const [state, setState] = useState<SidebarState>(() => {
    if (typeof window === 'undefined') {
      return { isOpen: defaultOpen, isMobileOpen: false };
    }

    try {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        return {
          isOpen: parsedState.isOpen ?? defaultOpen,
          isMobileOpen: false, // Mobile state không cần persist
        };
      }
    } catch (error) {
      console.warn('Failed to parse sidebar state from localStorage:', error);
    }

    return { isOpen: defaultOpen, isMobileOpen: false };
  });

  const updateState = useCallback((newState: Partial<SidebarState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      
      try {
        // Chỉ lưu isOpen, không lưu isMobileOpen
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify({
          isOpen: updatedState.isOpen
        }));
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }

      return updatedState;
    });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    updateState({ isOpen: open });
  }, [updateState]);

  const setMobileOpen = useCallback((open: boolean) => {
    updateState({ isMobileOpen: open });
  }, [updateState]);

  const toggleSidebar = useCallback(() => {
    updateState({ isOpen: !state.isOpen });
  }, [state.isOpen, updateState]);

  const toggleMobileSidebar = useCallback(() => {
    updateState({ isMobileOpen: !state.isMobileOpen });
  }, [state.isMobileOpen, updateState]);

  return {
    isOpen: state.isOpen,
    isMobileOpen: state.isMobileOpen,
    setOpen,
    setMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
  };
}

// Hook để quản lý state của các sidebar items (collapsible)
export function useSidebarItemsState() {
  const [itemsState, setItemsState] = useState<SidebarItemsState>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const stored = localStorage.getItem(SIDEBAR_ITEMS_STATE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse sidebar items state from localStorage:', error);
      return {};
    }
  });

  const setItemState = useCallback((itemKey: string, isOpen: boolean) => {
    setItemsState(prevState => {
      const newState = { ...prevState, [itemKey]: isOpen };
      
      try {
        localStorage.setItem(SIDEBAR_ITEMS_STATE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save sidebar items state to localStorage:', error);
      }

      return newState;
    });
  }, []);

  const getItemState = useCallback((itemKey: string, defaultOpen: boolean = false) => {
    return itemsState[itemKey] ?? defaultOpen;
  }, [itemsState]);

  return {
    setItemState,
    getItemState,
    itemsState,
  };
}

// Hook để quản lý state của một sidebar item cụ thể
export function useSidebarItemState(itemKey: string, defaultOpen: boolean = false) {
  const { setItemState, getItemState } = useSidebarItemsState();
  const isOpen = getItemState(itemKey, defaultOpen);

  const setOpen = useCallback((open: boolean) => {
    setItemState(itemKey, open);
  }, [itemKey, setItemState]);

  return [isOpen, setOpen] as const;
}

// Utility function để tạo key cho sidebar item
export function createSidebarItemKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
