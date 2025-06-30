import React, { useEffect, useRef, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader2 } from 'lucide-react';
import { CommentsProvider, useComments } from '@/Context/CommentsContext';
import { CommentsResponse, Comment, User } from '@/types/CommentTypes';
import CommentList from '@/Pages/Comments/CommentList';
import CommentForm from '@/Pages/Comments/CommentForm';
// import { v4 as uuidv4 } from 'uuid';

interface CommentsSectionProps {
  initialComments: CommentsResponse;
  onCommentSubmit: (content: string, parentId?: string) => Promise<void> | void;
  postId: string;
  currentUser: User | null;
}

const CommentsContent: React.FC<
  Omit<CommentsSectionProps, 'initialComments'>
> = ({ onCommentSubmit, postId, currentUser }) => {
  const {
    comments,
    nextPage,
    setComments,
    setNextPage,
    isLoading,
    addComment,
    addReply,
    removeComment,
    loadMoreComments,
    hasMore,
  } = useComments();

  const channelRef = useRef<any>(null);
  const isUnmountedRef = useRef(false);
  const processedCommentsRef = useRef<Set<string>>(new Set());
  const submittingRef = useRef<boolean>(false);

  // Thêm useEffect để debug comments state

  const handleCommentSubmit = useCallback(
    async (content: string, parentId?: string) => {
      if (!currentUser || submittingRef.current) return;

      // Prevent duplicate submissions
      submittingRef.current = true;

      console.log('Submitting comment:', content, 'parentId:', parentId);

      // Create unique optimistic ID
      const optimisticId = `temp-${currentUser.id}-${Date.now()}-${Math.random()}`;

      // Tạo comment tạm thời (optimistic) với HR badge info
      const optimisticComment: Comment = {
        id: optimisticId,
        comment: content,
        created_at: new Date().toISOString(),
        user: {
          id: currentUser.id,
          name: currentUser.name,
          profile_photo_path: currentUser.profile_photo_path,
          roles: currentUser.roles || [],
          departments: currentUser.departments || [],
        },
        parent_id: parentId || undefined,
        replies: [],
        isOptimistic: true,
      };

      console.log('Created optimistic comment:', optimisticComment);

      // Thêm comment tạm thời vào UI ngay lập tức
      if (parentId) {
        addReply(parentId, optimisticComment);
      } else {
        addComment(optimisticComment);
      }

      try {
        console.log('Calling onCommentSubmit...');
        await onCommentSubmit(content, parentId);
        console.log('onCommentSubmit completed successfully');
      } catch (error) {
        console.error('Error submitting comment:', error);
        // Xóa comment tạm thời nếu có lỗi
        removeComment(optimisticComment.id);
      } finally {
        // Reset submission flag after a delay to prevent rapid submissions
        setTimeout(() => {
          submittingRef.current = false;
        }, 1000);
      }
    },
    [onCommentSubmit, currentUser, addComment, addReply, removeComment],
  );

  useEffect(() => {
    if (!window.Echo || !postId) return;

    const channelName = `post.${postId}`;
    try {
      const channel = window.Echo.channel(channelName);
      channelRef.current = channel;

      const handleCommentPosted = (e: { comment: Comment }) => {
        if (!isUnmountedRef.current && e.comment) {
          console.log('New comment received:', e.comment);

          // Check if we've already processed this comment
          if (processedCommentsRef.current.has(e.comment.id)) {
            console.log('Comment already processed, skipping:', e.comment.id);
            return;
          }

          // Mark comment as processed
          processedCommentsRef.current.add(e.comment.id);

          // Use callback form of state updates to avoid stale closures
          setComments(prevComments => {
            // Kiểm tra và xóa comment tạm thời nếu tồn tại
            const optimisticComment = prevComments.find(
              c =>
                c.isOptimistic &&
                c.comment === e.comment.comment &&
                c.user.id === e.comment.user.id &&
                c.parent_id === e.comment.parent_id,
            );

            if (optimisticComment) {
              console.log('Replacing optimistic comment with real comment:', optimisticComment.id, '->', e.comment.id);
              // Remove optimistic comment first
              const withoutOptimistic = prevComments.filter(
                c => c.id !== optimisticComment.id,
              );

              // Check if real comment already exists
              const realCommentExists = withoutOptimistic.some(
                c => !c.isOptimistic && c.id === e.comment.id,
              );

              if (!realCommentExists) {
                if (e.comment.parent_id) {
                  // Handle reply case inside state update
                  return withoutOptimistic.map(comment =>
                    comment.id === e.comment.parent_id
                      ? {
                          ...comment,
                          replies: [...(comment.replies || []), e.comment],
                        }
                      : comment,
                  );
                } else {
                  // Add new top-level comment
                  return [e.comment, ...withoutOptimistic];
                }
              }
              return withoutOptimistic;
            }

            // If no optimistic comment found, just check if we need to add the real one
            const realCommentExists = prevComments.some(
              c => !c.isOptimistic && c.id === e.comment.id,
            );

            if (!realCommentExists) {
              console.log('Adding new real-time comment:', e.comment.id);
              if (e.comment.parent_id) {
                return prevComments.map(comment =>
                  comment.id === e.comment.parent_id
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), e.comment],
                      }
                    : comment,
                );
              } else {
                return [e.comment, ...prevComments];
              }
            }

            console.log('Comment already exists, skipping:', e.comment.id);
            return prevComments;
          });
        }
      };

      const handleCommentDeleted = (e: { commentId: string | number }) => {
        if (!isUnmountedRef.current && e.commentId) {
          console.log('Comment deleted:', e.commentId);
          removeComment(String(e.commentId));
        }
      };

      // Listen for real-time events
      channel.listen('.CommentPosted', handleCommentPosted);
      channel.listen('.CommentDeleted', handleCommentDeleted);

      console.log(`Listening for real-time comments on channel: ${channelName}`);

      return () => {
        isUnmountedRef.current = true;
        if (channelRef.current) {
          try {
            channelRef.current.stopListening('.CommentPosted');
            channelRef.current.stopListening('.CommentDeleted');
            window.Echo.leaveChannel(channelName);
          } catch (error) {
            console.warn('Error cleaning up Echo channel:', error);
          }
        }
        channelRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up Echo channel:', error);
    }
  }, [postId, addComment, addReply, removeComment]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      // Clear processed comments on unmount
      processedCommentsRef.current.clear();
      submittingRef.current = false;
    };
  }, []);

  const commentCount = comments?.length || 0;
  const hasComments = commentCount > 0;

  return (
    <div className="w-full space-y-6">
      {currentUser ? (
        <div className="bg-white dark:bg-[#0F1014] p-4">
          <CommentForm
            onSubmit={content => handleCommentSubmit(content)}
            placeholder="Share your thoughts..."
            buttonText="Send"
          />
        </div>
      ) : (
        <div
          className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900
            rounded-lg text-center border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col items-center space-y-3">
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Join the conversation
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to leave a comment and engage with the community
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Comments
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {commentCount}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading...
          </div>
        )}
      </div>

      {!hasComments ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Be the first to share your thoughts and start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <InfiniteScroll
            dataLength={commentCount}
            next={loadMoreComments}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading more comments...
                </div>
              </div>
            }
            endMessage={
              commentCount > 5 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You've reached the end of the comments
                  </p>
                </div>
              ) : null
            }
          >
            <CommentList
              comments={comments}
              onReply={handleCommentSubmit}
              currentUser={currentUser}
            />
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({
  initialComments,
  postId,
  ...props
}) => {
  return (
    <CommentsProvider initialComments={initialComments} postId={postId}>
      <CommentsContent postId={postId} {...props} />
    </CommentsProvider>
  );
};

export default CommentsSection;
