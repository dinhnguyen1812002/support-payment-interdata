import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { MessageCircle, Trash2, MoreHorizontal, Flag, X } from 'lucide-react';
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

  // Constants for HR detection
  const HR_ROLES = ['admin', 'department_manager'] as const;
  const HR_DEPARTMENTS = ['hr', 'human resources', 'nhân sự', 'support'] as const;

  // Function to check if user is HR staff and get their badge info
  // This function identifies HR staff based on roles (admin, department_manager)
  // or departments (HR, Support, etc.) and returns appropriate badge styling
  const getHRBadgeInfo = (user: User): { isHR: boolean; badgeText: string; badgeClass: string } => {
    if (!user.roles?.length && !user.departments?.length) {
      return { isHR: false, badgeText: '', badgeClass: '' };
    }

    // Check if user has admin role
    const isAdmin = user.roles?.some(role => role === 'admin');
    if (isAdmin) {
      return {
        isHR: true,
        badgeText: 'Admin',
        badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700'
      };
    }

    // Check if user has department_manager role
    const isDeptManager = user.roles?.some(role => role === 'department_manager');
    if (isDeptManager) {
      return {
        isHR: true,
        badgeText: 'Quản lý',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-700'
      };
    }

    // Check if user belongs to HR department (you can customize department names)
    const hasHRDepartment = user.departments?.some(dept =>
      HR_DEPARTMENTS.includes(dept.toLowerCase() as any)
    );

    if (hasHRDepartment) {
      return {
        isHR: true,
        badgeText: 'Nhân sự',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700'
      };
    }

    return { isHR: false, badgeText: '', badgeClass: '' };
  };

  const hrBadgeInfo = getHRBadgeInfo(comment.user);

  const handleReply = (content: string) => {
    // Convert comment.id to number if it's a string
    onReply(content, comment.id);
    setIsReplying(false);
  };

  const handleCancelReply = () => {
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
        <Card className={`overflow-hidden dark:bg-[#0F1014] ${
          hrBadgeInfo.isHR
            ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          <CardContent className="relative pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 rounded-md">
                  <AvatarImage src={avatarUrl} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-800 text-sm font-semibold leading-tight dark:text-gray-200">
                      {comment.user.name}
                    </h3>
                    {hrBadgeInfo.isHR && (
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-0.5 ${hrBadgeInfo.badgeClass}`}
                      >
                        {hrBadgeInfo.badgeText}
                      </Badge>
                    )}
                  </div>
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
                    {/*<DropdownMenuItem className="text-gray-500">*/}
                    {/*  <Flag className="w-4 h-4 mr-2" />*/}
                    {/*  Report*/}
                    {/*</DropdownMenuItem>*/}
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Replying to {comment.user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelReply}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
                <span className="ml-1 text-xs">Cancel</span>
              </Button>
            </div>
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
