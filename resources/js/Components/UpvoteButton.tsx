import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface UpvoteButtonProps {
  post_id: string; // Use ID for upvote functionality
  initialUpvoteCount: number;
  initialHasUpvoted: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'detail';
  className?: string;
  disabled?: boolean;
}

export function UpvoteButton({
  post_id,
  initialUpvoteCount,
  initialHasUpvoted,
  size = 'md',
  variant = 'card',
  className = '',
  disabled = false,
}: UpvoteButtonProps) {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (isUpvoting || disabled) return;
    
    setIsUpvoting(true);
    
    // Optimistic update
    const newHasUpvoted = !hasUpvoted;
    const newUpvoteCount = newHasUpvoted ? upvoteCount + 1 : upvoteCount - 1;
    
    setHasUpvoted(newHasUpvoted);
    setUpvoteCount(newUpvoteCount);

    router.post(
      route('posts.upvote', post_id),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          // Keep optimistic update - server handles the actual state
        },
        onError: () => {
          // Revert optimistic update on error
          setHasUpvoted(!newHasUpvoted);
          setUpvoteCount(newHasUpvoted ? upvoteCount - 1 : upvoteCount + 1);
        },
        onFinish: () => {
          setIsUpvoting(false);
        }
      }
    );
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 w-8 p-0',
          icon: 'h-4 w-4',
          count: 'text-xs',
        };
      case 'lg':
        return {
          button: 'h-12 w-12 p-0',
          icon: 'h-6 w-6',
          count: 'text-base',
        };
      default:
        return {
          button: 'h-10 w-10 p-0',
          icon: 'h-5 w-5',
          count: 'text-sm',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'detail') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className={`${sizeClasses.button} transition-colors ${
            hasUpvoted
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
              : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
          } ${isUpvoting || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleUpvote}
          disabled={isUpvoting || disabled}
        >
          <ChevronUp
            className={`${sizeClasses.icon} ${hasUpvoted ? 'fill-current' : ''}`}
          />
        </Button>
        <div className="text-center">
          <div
            className={`${sizeClasses.count} font-semibold ${
              hasUpvoted
                ? 'text-orange-600'
                : 'text-muted-foreground'
            }`}
          >
            {upvoteCount}
          </div>
          <div className="text-xs text-muted-foreground">
            {upvoteCount === 1 ? 'vote' : 'votes'}
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className={`${sizeClasses.button} transition-colors ${
          hasUpvoted
            ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
            : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
        } ${isUpvoting || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleUpvote}
        disabled={isUpvoting || disabled}
      >
        <ChevronUp
          className={`${sizeClasses.icon} ${hasUpvoted ? 'fill-current' : ''}`}
        />
      </Button>
      <span
        className={`${sizeClasses.count} font-medium ${
          hasUpvoted ? 'text-orange-600' : 'text-muted-foreground'
        }`}
      >
        {upvoteCount}
      </span>
    </div>
  );
}
