// UpvoteButton.tsx
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import { Button } from '@/Components/ui/button';

interface UpvoteButtonProps {
  postId: string;
  initialUpvote: number;
  initialHasUpvote: boolean;
  onUpvoteChange?: (newUpvote: number, newHasUpvote: boolean) => void; // Callback mới
}

interface PostData {
  upvote_count: number;
  has_upvote: boolean;
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  postId,
  initialUpvote,
  initialHasUpvote,
  onUpvoteChange,
}) => {
  const [upvote, setUpvote] = useState(initialUpvote);
  const [hasUpvote, setHasUpvote] = useState(initialHasUpvote);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<
    'increment' | 'decrement' | null
  >(null);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const toggleUpvote = () => {
    if (loading) return;
    setLoading(true);

    setAnimationType(hasUpvote ? 'decrement' : 'increment');
    setIsAnimating(true);

    // Dự đoán thay đổi trước khi gửi request
    const newUpvote = hasUpvote ? upvote - 1 : upvote + 1;
    const newHasUpvote = !hasUpvote;
    setUpvote(newUpvote);
    setHasUpvote(newHasUpvote);
    onUpvoteChange?.(newUpvote, newHasUpvote); // Gọi callback ngay lập tức

    router.post(
      `/posts/${postId}/upvote`,
      {},
      {
        preserveScroll: true,
        onSuccess: page => {
          const updatedPost = page.props.post as PostData;
          if (updatedPost) {
            setUpvote(updatedPost.upvote_count);
            setHasUpvote(updatedPost.has_upvote);
            onUpvoteChange?.(updatedPost.upvote_count, updatedPost.has_upvote);
          }
        },
        onError: () => {
          // Hoàn nguyên nếu có lỗi
          setUpvote(initialUpvote);
          setHasUpvote(initialHasUpvote);
          onUpvoteChange?.(initialUpvote, initialHasUpvote);
        },
        onFinish: () => setLoading(false),
      },
    );
  };

  const getCountClassName = () => {
    let baseClass = 'ml-1 transition-all duration-300 inline-block';
    if (isAnimating) {
      if (animationType === 'increment') {
        return `${baseClass} animate-upvote text-green-500`;
      }
      if (animationType === 'decrement') {
        return `${baseClass} animate-downvote text-gray-600`;
      }
    }
    return `${baseClass} ${hasUpvote ? '' : 'text-gray-600'}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleUpvote}
            className={`flex items-center transition gap-1 px-2 py-1 text-sm ${hasUpvote ? '' : 'text-gray-600 hover:text-gray-600'}`}
            disabled={loading}
          >
            <ArrowUp
              className={`w-4 h-4 transition ${hasUpvote ? '' : 'text-gray-600'} ${loading ? 'opacity-50' : ''}`}
            />
            <span className={getCountClassName()}>{upvote}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasUpvote ? 'Bỏ vote bài viết này' : 'Upvote bài viết này'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UpvoteButton;
