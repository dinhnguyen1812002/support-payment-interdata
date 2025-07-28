import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { route } from 'ziggy-js';
import { Category, Notification, Tag } from '@/types';
import { CommentsResponse } from '@/types/CommentTypes';
import PostContent from '@/Components/post-content';
import SearchComponent from '@/Components/Search';
import Sidebar from '@/Components/Sidebar';
import SearchInput from '@/Components/search-input';
import LatestPosts from '@/Pages/Posts/LatestPost';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  user: { id: number; name: string; profile_photo_path: string };
  categories: Category[];
  created_at: string;
  comments: CommentsResponse;
  has_upvote: boolean;
  upvote_count: number;
  tags: Tag[];
}

interface PostDetailProps {
  post: BlogPost;
  keyword?: string;
  auth: { user: { id: number; name: string; profile_photo_path: string } };
  notifications?: Notification[];
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  auth,
  keyword,
  notifications = [],
}) => {
  const currentUser = auth?.user || null;

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.get('/posts/search', { search: value, page: 1 });
    }
  };

  // Submit a new comment
  const handleCommentSubmit = (content: string, parentId?: string) => {
    router.post(
      route('comments.store'),
      {
        comment: content,
        post_id: post.id,
        parent_id: parentId || null,
      },
      {
        preserveScroll: true,
        onError: errors => {
          console.error('Error submitting comment:', errors);
        },
      },
    );
  };



  const title = post.title;

  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className="max-w-[1354px] mx-auto px-4">
        <div className="flex">
          <SearchComponent initialSearch={keyword} route="/posts/search">
            <div className="flex gap-x-4">
              <div className="hidden lg:block w-52 pr-2 ml-[-10px]">
                <Sidebar categories={[]} />
              </div>

              <PostContent
                post={post}
                currentUser={currentUser}
                onCommentSubmit={handleCommentSubmit}
              />

              <div className="hidden lg:block mt-5 w-72">
                <div className="top-4">
                  <div className="mb-6">
                    <SearchInput
                      placeholder="Tìm kiếm..."
                      onSearch={handleSearch}
                    />
                  </div>
                  <div className="hidden lg:block mt-5">
                    <div className="top-4">
                      <LatestPosts />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SearchComponent>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostDetail;
