import React, { useEffect, useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Category, Notification, Tag } from '@/types';
import UpvoteButton from '@/Components/VoteButton';
import SearchComponent from '@/Components/Search';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import LatestPosts from '@/Pages/Posts/LatestPost';
import Sidebar from '@/Components/Sidebar';
import SearchInput from '@/Components/search-input';
import { Comment, CommentsResponse } from '@/types/CommentTypes';
import PostContent from '@/Components/post-content';

interface BlogPost {
  next_page_url: string | null;
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  user: { id: number; name: string; profile_photo_path: string };
  categories: Category[];
  created_at: string;
  comments: Comment[];
  has_upvote: boolean;
  upvote_count: number;
  tags: Tag[];
}

interface PostDetailProps {
  post: BlogPost;
  categories: Category[];
  keyword: string;
  auth: { user: { id: number; name: string; profile_photo_path: string } };
  notifications: Notification[];
}

interface NewCommentEvent {
  comment: Comment;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  auth,
  categories,
  notifications,
  keyword,
}) => {
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { props } = usePage();
  const selectedCategory = props.selectedCategory;
  const currentUser = auth?.user || null;
  const [body, setBody] = useState('');
  const channelRef = useRef<any>(null);
  const isUnmountedRef = useRef(false);

  const userAvatar = auth?.user?.profile_photo_path
    ? `/storage/${auth.user.profile_photo_path}`
    : null;

  const authorAvatar = post.user.profile_photo_path
    ? `/storage/${post.user.profile_photo_path}`
    : null;

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.get('/posts/search', { search: value, page: 1 });
    }
  };

  // Submit a new comment
  const handleCommentSubmit = (content: string, parentId?: string) => {
    setIsSubmitting(true);
    router.post(
      route('comments.store'),
      {
        comment: content,
        post_id: post.id,
        parent_id: parentId || null,
      },
      {
        onSuccess: () => {
          setBody('');
          setIsSubmitting(false);
        },
        preserveScroll: true,
        onError: errors => {
          console.error('Error submitting comment:', errors);
          setIsSubmitting(false);
        },
      },
    );
  };

  // Setup Echo channel for real-time comment updates
  useEffect(() => {
    if (!window.Echo || !post.id) return;

    const channelName = `post.${post.id}`;
    try {
      const channel = window.Echo.channel(channelName);
      channelRef.current = channel;

      const handleCommentPosted = (e: NewCommentEvent) => {
        if (!isUnmountedRef.current && e.comment) {
          console.log('New comment received:', e.comment);

          // Prevent duplicate comments
          setComments(prevComments => {
            const commentExists = prevComments.some(c => c.id === e.comment.id);
            if (commentExists) return prevComments;

            if (e.comment.parent_id) {
              // Handle reply: find parent comment and append reply
              return prevComments.map(comment => {
                if (comment.id === e.comment.parent_id) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), e.comment],
                  };
                }
                return comment;
              });
            } else {
              // Add top-level comment
              return [e.comment, ...prevComments];
            }
          });
        }
      };

      channel.listen('CommentPosted', handleCommentPosted);

      console.log(`Subscribed to channel: ${channelName}`);

      return () => {
        isUnmountedRef.current = true;
        if (channelRef.current) {
          try {
            channelRef.current.stopListening('CommentPosted');
            window.Echo.leaveChannel(channelName);
            console.log(`Left channel: ${channelName}`);
          } catch (error) {
            console.warn('Error cleaning up Echo channel:', error);
          }
        }
        channelRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up Echo channel:', error);
    }
  }, [post.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const title = post.title;
  const initialComments: CommentsResponse = {
    data: comments,
    next_page_url: post.next_page_url,
  };

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
                comments={comments}
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
