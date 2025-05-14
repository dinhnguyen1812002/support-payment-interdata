// components/PostContent.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import UpvoteButton from '@/Components/VoteButton';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import { Comment } from '@/types/CommentTypes';
import { Category, Tag } from '@/types';

interface PostContentProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user: { name: string; profile_photo_path: string };
    categories: Category[];
    tags: Tag[];
    upvotes_count: number;
    has_upvoted: boolean;
    next_page_url: string | null;
  };
  comments: Comment[];
  currentUser: { id: number; name: string; profile_photo_path: string } | null;
  onCommentSubmit: (content: string, parentId?: number) => void;
  showBorder?: boolean; // <-- NEW
}

const PostContent: React.FC<PostContentProps> = ({
  post,
  comments,
  currentUser,
  onCommentSubmit,
  showBorder = true,
}) => {
  const authorAvatar = post.user.profile_photo_path
    ? `/storage/${post.user.profile_photo_path}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`;

  return (
    <div
      className={`flex-1 w-full max-w-5xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 dark:bg-[#0F1014] ${
        showBorder ? 'lg:border-l' : ''
      } lg:pl-8 xl:pl-12`}
    >
      <div className="mt-5 space-y-4">
        <div className="mb-1">
          <span className="text-2xl font-bold  mb-0 me-1 dark:text-[#F5F5F5]">
            {post.title}
          </span>
          <div className="mb-6 max-w-none prose prose-lg">
            <p
              className="text-lg font-normal dark:text-[#F5F5F5] mb-10 mr-1 "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage src={authorAvatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
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
            {post.categories.map(category => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}/posts`}
                className="cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-medium rounded border border-dashed dark:text-white
                    hover:border-blue-600 dark:bg-[#0F1014]"
                >
                  {category.title}
                </Badge>
              </Link>
            ))}
            {post.tags.map(tag => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-3 py-1 text-sm font-medium rounded-lg  hover:border-solid"
              >
                {tag.name}
              </Badge>
            ))}
            <UpvoteButton
              postId={post.id}
              initialUpvotes={post.upvotes_count}
              initialHasUpvoted={post.has_upvoted}
            />
          </div>
        </div>
        <hr className="w-full border-t border-dashed border-gray-300 mt-8 mb-8" />
        <CommentsSection
          initialComments={{
            data: comments,
            next_page_url: post.next_page_url,
          }}
          onCommentSubmit={onCommentSubmit}
          postId={post.id}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default PostContent;
