import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface NavigationState {
  isNavigating: boolean;
  currentUrl: string;
  previousUrl: string | null;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    currentUrl: typeof window !== 'undefined' ? window.location.pathname : '',
    previousUrl: null,
  });

  useEffect(() => {
    const handleStart = (event: any) => {
      setState(prev => ({
        ...prev,
        isNavigating: true,
        previousUrl: prev.currentUrl,
      }));
    };

    const handleFinish = (event: any) => {
      setState(prev => ({
        ...prev,
        isNavigating: false,
        currentUrl: event.detail?.page?.url || prev.currentUrl,
      }));
    };

    const handleError = (event: any) => {
      setState(prev => ({
        ...prev,
        isNavigating: false,
      }));
    };

    // Listen to Inertia events
    document.addEventListener('inertia:start', handleStart);
    document.addEventListener('inertia:finish', handleFinish);
    document.addEventListener('inertia:error', handleError);

    return () => {
      document.removeEventListener('inertia:start', handleStart);
      document.removeEventListener('inertia:finish', handleFinish);
      document.removeEventListener('inertia:error', handleError);
    };
  }, []);

  const navigate = (url: string, options?: any) => {
    router.visit(url, {
      preserveScroll: true,
      preserveState: true,
      ...options,
    });
  };

  const navigateReplace = (url: string, options?: any) => {
    router.visit(url, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      ...options,
    });
  };

  return {
    ...state,
    navigate,
    navigateReplace,
  };
}

// Hook để tạo navigation function với loading state
export function useNavigationWithLoading() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoading = async (url: string, options?: any) => {
    setIsLoading(true);
    try {
      await navigation.navigate(url, options);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...navigation,
    isLoading: isLoading || navigation.isNavigating,
    navigateWithLoading,
  };
}

// Utility function để check active route
export function useActiveRoute() {
  const { currentUrl } = useNavigation();

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return currentUrl === path;
    }
    return currentUrl.startsWith(path);
  };

  const isActiveRoute = (routes: string[], exact: boolean = false) => {
    return routes.some(route => isActive(route, exact));
  };

  return {
    currentUrl,
    isActive,
    isActiveRoute,
  };
}
