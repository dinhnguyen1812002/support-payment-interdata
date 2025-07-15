// BlogCard.tsx
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import useTypedPage from '@/Hooks/useTypedPage';
import { BlogPost, Paginate } from '@/types';
import { generateSlug } from '@/Utils/slugUtils';
import UpvoteButton from '@/Components/VoteButton';
import { route } from 'ziggy-js';
import { Button } from '@/Components/ui/button';
import Pagination from '@/Components/Pagination';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';

interface BlogCardProps {
  posts: BlogPost[];
  postCount: number;
  pagination: Paginate;
}

const BlogCard: React.FC<BlogCardProps> = ({
  posts: initialPosts = [],
  postCount,
  pagination,
}) => {
  const page = useTypedPage();
  const isAuthenticated = !!page.props.auth.user;
  const [posts, setPosts] = useState(initialPosts); // Quản lý posts bằng state

  const handleUpvoteChange = (
    postId: string,
    newUpvote: number,
    newHasUpvote: boolean,
  ) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, upvote_count: newUpvote, has_upvote: newHasUpvote }
          : post,
      ),
    );
  };

  if (posts.length === 0) {
    return (
      <div className="flex justify-between items-center flex-wrap mb-8 lg:mb-7">
        <div className="space-y-1">
          <span className="font-bold text-2xl text-customBlue dark:text-white">
            No Question Ask
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {isAuthenticated ? (
            <Link href={route('posts.create')} className="w-full sm:w-auto">

              <Button variant="default">
                <span className="hidden sm:inline">Ask Question</span>
                <span className="sm:hidden">Ask Question</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="default">
                <span className="hidden sm:inline">Ask Question</span>
                <span className="sm:hidden">Ask Question</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen flex flex-col flex-1">
      <div className="flex justify-between items-center flex-wrap mb-8 lg:mb-7">
        <div className="space-y-1">
          <span className="font-bold text-2xl text-customBlue dark:text-white">
            All Tickets
            <small className="text-gray-500 dark:text-gray-400 text-base font-semibold ml-1">
              ({postCount})
            </small>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {isAuthenticated ? (
            <Link href={route('posts.create')} className="w-full sm:w-auto">
                <Button variant="default">
                <span className="hidden sm:inline">Ask Question</span>
                <span className="sm:hidden">Ask Question</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="default">
                <span className="hidden sm:inline">Ask Question</span>
                <span className="sm:hidden">Ask Question</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-1 items-stretch w-full max-w-5xl mx-auto">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex flex-col flex-1 items-stretch w-full max-w-(--breakpoint-lg) min-h-[150px] border-gray-200 dark:border-gray-700"
          >
            <div className="flex">
              <div className="flex-1 mb-2">
                <div className="pt-0">
                  <div className="space-y-3 mb-4">
                    <Link href={`/posts/${post.slug}`} className="block group">
                      <h1 className="block text-[25px] font-semibold text-customBlue hover:text-blue-700 dark:text-white dark:hover:text-blue-300 mr-1 break-words">
                        {post.title}
                      </h1>
                      <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-300 break-words overflow-hidden">
                        {post.content}
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center py-1">
                      {/* <Avatar className="flex items-center justify-center rounded-lg h-9 w-9 bg-green-100 dark:bg-green-900 text-2xl font-semibold uppercase dark:text-green-200">
                        <AvatarImage
                          src={post.user.profile_photo_url}
                          alt={post.user.name}
                        />
                       
                      </Avatar> */}
                      <AvatarWithFallback
                        src={post.user.profile_photo_url}
                        name={post.user.name}
                        alt={post.user.name}
                        className="h-9 w-9"
                        variant="identicon"
                        square={true}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {post.user.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <time dateTime={post.created_at}>
                          {post.created_at}
                        </time>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-wrap gap-2">
                      {post.categories &&
                        post.categories.map(category => (
                          <Link
                            key={category.id}
                            href={`/categories/${generateSlug(category.title)}/posts`}
                          >
                            <Badge
                              variant="outline"
                              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
                              rounded border border-gray-200 border-dashed dark:border-gray-600 hover:border-blue-600
                               dark:hover:border-blue-400 dark:bg-[#0F1014]"
                            >
                              {category.title}
                            </Badge>
                          </Link>
                        ))}
                    </div>

                    {post.tags &&
                      post.tags.map(tags => (
                        <Badge
                          key={tags.id}
                          variant="secondary"
                          className="px-3 py-2  text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md   dark:bg-[#0F1014]"
                        >
                          {tags.name}
                        </Badge>
                      ))}
                    {/*<div className="flex flex-wrap gap-2">*/}
                    {/*   <Badge> {post.tags.name}</Badge>*/}
                    {/*</div>*/}
                    <UpvoteButton
                      postId={post.id}
                      initialUpvote={post.upvote_count}
                      initialHasUpvote={post.has_upvoted}
                      onUpvoteChange={(newUpvote, newHasUpvote) =>
                        handleUpvoteChange(post.id, newUpvote, newHasUpvote)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            {index !== posts.length - 1 && (
              <hr className="w-full border-t border-dashed border-gray-300 dark:border-gray-600 my-4" />
            )}
          </div>
        ))}
      </div>
      {pagination && pagination.total > 0 && (
        <div className=" flex justify-center">
          <Pagination
            current_page={pagination.current_page}
            next_page_url={pagination.next_page_url}
            prev_page_url={pagination.prev_page_url}
            last_page={pagination.last_page}
          />
        </div>
      )}
    </div>
  );
};

export default BlogCard;
