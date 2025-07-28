import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import UpvoteButton from '@/Components/VoteButton';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import { CommentsResponse } from '@/types/CommentTypes';
import { Category, Tag } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { toast } from '@/Hooks/use-toast';
import { ChevronDown, Globe, Lock, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { assign } from 'lodash';

interface PostContentProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user: { id: number; name: string; profile_photo_path: string };
    categories: Category[];
    tags: Tag[];
    is_published: boolean;
    upvote_count: number;
    has_upvote: boolean;
    comments: CommentsResponse;

  };
  currentUser: { id: number; name: string; profile_photo_path: string } | null;
  onCommentSubmit: (content: string, parentId?: string) => void;
  showBorder?: boolean;
}



const PostContent: React.FC<PostContentProps> = ({
  post,
  currentUser,
  onCommentSubmit,
  showBorder = true,
}) => {
  const [isPublished, setIsPublished] = useState(post.is_published);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


  const authorAvatar = post.user.profile_photo_path
    ? `/storage/${post.user.profile_photo_path}`
    : null;

  // Check if the current user is authorized to update the post status
  const canUpdateStatus = currentUser && currentUser.id === post.user.id;

  // Handle status update
  const handleStatusUpdate = async (newStatus: boolean) => {
    if (isUpdatingStatus) return; // Prevent double clicks

    setIsUpdatingStatus(true);

    try {
      router.patch(
        route('posts.update-status', post.id),
        {
          is_published: newStatus,
        },
        {
          preserveScroll: true,
          onSuccess: page => {
            setIsPublished(newStatus);
          },
          onError: errors => {
            console.error('Status update errors:', errors);
          },
          onFinish: () => {
            setIsUpdatingStatus(false);
          },
        },
      );
    } catch (error) {
      console.error('Status update error:', error);
      setIsUpdatingStatus(false);
    }
  };

  // Setup Echo channel for real-time comment updates





  return (
    <div
      className={`flex-1 w-full max-w-5xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 ${
        showBorder ? 'lg:border-l' : ''
      } lg:pl-8 xl:pl-12`}
    >
      <div className="mt-5 space-y-4 dark:text-[#F5F5F5] ">
        <div className="mb-1">
          <span className="text-xl font-bold mb-0 me-1 dark:text-[#F5F5F5]">
            {post.title}
          </span>
          <div className="mb-6 max-w-none prose prose-lg">
            <article
              className="text-lg font-normal dark:text-[#F5F5F5] mb-10 mr-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></article>
          </div>
        </div>
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center space-x-2">
            <AvatarWithFallback
              src={authorAvatar}
              name={post.user.name}
              alt={post.user.name}
              className="h-10 w-10"
              variant="geometric"
              square={true}
            />
            <div>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                {post.user.name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <time dateTime={post.created_at}>{post.created_at}</time>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {canUpdateStatus && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                    className={`flex items-center `}
                  >
                    {/*{isUpdatingStatus ? (*/}
                    {/*  <Loader2 className="w-4 h-4 animate-spin" />*/}
                    {/*) : isPublished ? (*/}
                    {/*  <Globe className="w-4 h-4" />*/}
                    {/*) : (*/}
                    {/*  <Lock className="w-4 h-4" />*/}
                    {/*)}*/}
                    <span>{isPublished ? 'Public' : 'Private'}</span>
                    {!isUpdatingStatus && <ChevronDown className="w-4 h-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Post Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(true)}
                    disabled={isUpdatingStatus || isPublished}
                    className="flex items-center space-x-2"
                  >
                    <span>Set to Public</span>
                    {isPublished && (
                      <span className="text-xs text-gray-500">(Current)</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(false)}
                    disabled={isUpdatingStatus || !isPublished}
                    className="flex items-center space-x-2"
                  >
                    <span>Set to Private</span>
                    {!isPublished && (
                      <span className="text-xs text-gray-500">(Current)</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {post.categories.map(category => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}/posts`}
                className="cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-medium rounded border dark:border-gray-600
                  border-dashed dark:text-white hover:border-blue-600 dark:bg-[#0F1014]"
                >
                  {category.title}
                </Badge>
              </Link>
            ))}
            {post.tags.map(tag => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-3 py-1 text-sm font-medium rounded-lg hover:border-solid"
              >
                {tag.name}
              </Badge>
            ))}
            <UpvoteButton
              postId={post.id}
              initialUpvote={post.upvote_count}
              initialHasUpvote={post.has_upvote}
            />
          </div>
        </div>
        <hr className="w-full border-t border-dashed border-gray-300 mt-8 mb-8" />
        <CommentsSection
          initialComments={post.comments}
          onCommentSubmit={onCommentSubmit}
          postId={post.id}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default PostContent;
