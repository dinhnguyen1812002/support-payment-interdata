import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { MessageCircle, Trash2, MoreHorizontal, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { CommentsResponse, Comment, User } from '@/types/CommentTypes';
import { useComments } from '@/Context/CommentsContext';
import { formatTimeAgo, getAvatarUrl } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: string) => void; // Fixed: consistent number type
  currentUser: User | null;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  currentUser,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeComment } = useComments();
  const avatarUrl = getAvatarUrl(comment.user);
  const canDelete = currentUser?.id === comment.user.id;
  const formattedDate = formatTimeAgo(comment.created_at);

  const handleReply = (content: string) => {
    // Convert comment.id to number if it's a string

    onReply(content, comment.id);
    setIsReplying(false);
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await new Promise((resolve, reject) => {
        router.delete(`/comments/${comment.id}`, {
          onSuccess: () => {
            removeComment(comment.id);
            resolve(true);
          },
          onError: errors => {
            console.error('Error deleting comment:', errors);
            reject(errors);
          },
        });
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const maxNestingLevel = 4;
  const shouldNestReplies = depth < maxNestingLevel;

  // Fixed: Use predefined Tailwind classes instead of dynamic ones
  const getIndentationClass = (depth: number) => {
    const indentClasses = {
      0: '',
      1: 'ml-4',
      2: 'ml-8',
      3: 'ml-12',
      4: 'ml-16',
    };
    return indentClasses[Math.min(depth, 4) as keyof typeof indentClasses];
  };

  const indentationClass = getIndentationClass(depth);

  return (
    <div className={`flex gap-4 ${indentationClass}`}>
      <div className="flex-1 space-y-4">
        <Card className="overflow-hidden dark:bg-[#0F1014] border-gray-200 dark:border-gray-700">
          <CardContent className="relative pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 rounded-md">
                  <AvatarImage src={avatarUrl} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col justify-center">
                  <h3 className="text-gray-800 text-sm font-semibold leading-tight mb-0.5 dark:text-gray-200">
                    {comment.user.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold leading-tight dark:text-gray-400">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="absolute top-2 right-2 flex gap-1">
                {currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    disabled={isDeleting}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="ml-1 text-xs">Reply</span>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      disabled={isDeleting}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-600 focus:text-red-600"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-gray-500">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                {comment.comment}
              </p>
            </div>
          </CardContent>
        </Card>

        {isReplying && currentUser && (
          <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply..."
              buttonText="Reply"
              autoFocus
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div
            className={
              shouldNestReplies
                ? 'ml-6 border-l border-gray-200 dark:border-gray-700 pl-4'
                : ''
            }
          >
            <CommentList
              comments={comment.replies}
              onReply={onReply}
              currentUser={currentUser}
              depth={shouldNestReplies ? depth + 1 : depth}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
