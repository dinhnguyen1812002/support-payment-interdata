import React, { useEffect, useState } from 'react';
import { useNavigation } from '@/Hooks/use-navigation';
import { cn } from '@/lib/utils';

interface NavigationProgressProps {
  className?: string;
  color?: string;
  height?: number;
}

export function NavigationProgress({ 
  className, 
  color = 'bg-primary', 
  height = 2 
}: NavigationProgressProps) {
  const { isNavigating } = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      setVisible(true);
      setProgress(0);
      
      // Simulate progress
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => clearInterval(timer);
    } else {
      // Complete the progress bar
      setProgress(100);
      
      // Hide after animation
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);

      return () => clearTimeout(hideTimer);
    }
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div 
      className={cn(
        'fixed top-0 left-0 z-50 transition-all duration-200 ease-out',
        className
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className={cn(
          'h-full transition-all duration-200 ease-out',
          color
        )}
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.1s ease-out',
        }}
      />
    </div>
  );
}

// Loading overlay component
interface NavigationLoadingProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigationLoading({ children, className }: NavigationLoadingProps) {
  const { isNavigating } = useNavigation();

  return (
    <div className={cn('relative', className)}>
      {children}
      {isNavigating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loading spinner
export function NavigationSpinner({ className }: { className?: string }) {
  const { isNavigating } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className={cn('animate-spin rounded-full h-4 w-4 border-b-2 border-primary', className)} />
  );
}
