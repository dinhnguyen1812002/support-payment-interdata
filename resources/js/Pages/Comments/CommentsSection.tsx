import React, { useEffect, useRef, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader2 } from 'lucide-react';
import { CommentsProvider, useComments } from '@/Context/CommentsContext';
import { CommentsResponse, Comment, User } from '@/types/CommentTypes';
import CommentList from '@/Pages/Comments/CommentList';
import CommentForm from '@/Pages/Comments/CommentForm';

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

  // Handle comment submission with proper type conversion
  const handleCommentSubmit = useCallback(
    async (content: string, parentId?: string) => {
      try {
        await onCommentSubmit(content, parentId);
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    },
    [onCommentSubmit],
  );

  // Setup Echo channel for real-time updates
  useEffect(() => {
    if (!window.Echo || !postId) return;

    const channelName = `post.${postId}`;

    try {
      const channel = window.Echo.channel(channelName);
      channelRef.current = channel;

      const handleCommentPosted = (e: { comment: Comment }) => {
        if (!isUnmountedRef.current && e.comment) {
          console.log('New comment received:', e.comment);

          // Don't add comments from the current user (they're already added locally)
          if (e.comment.user?.id === currentUser?.id) {
            return;
          }

          if (e.comment.parent_id) {
            // If it's a reply, use addReply
            addReply(e.comment.parent_id, e.comment);
          } else {
            // If it's a top-level comment, use addComment
            addComment(e.comment);
          }
        }
      };

      const handleCommentDeleted = (e: { commentId: string | number }) => {
        if (!isUnmountedRef.current && e.commentId) {
          console.log('Comment deleted:', e.commentId);
          removeComment(String(e.commentId));
        }
      };

      // Listen for events
      channel.listen('CommentPosted', handleCommentPosted);
      channel.listen('CommentDeleted', handleCommentDeleted);

      console.log(`Subscribed to channel: ${channelName}`);

      return () => {
        isUnmountedRef.current = true;

        if (channelRef.current) {
          try {
            channelRef.current.stopListening('CommentPosted');
            channelRef.current.stopListening('CommentDeleted');
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
  }, [postId, addComment, addReply, removeComment, currentUser?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const commentCount = comments?.length || 0;
  const hasComments = commentCount > 0;

  return (
    <div className="w-full space-y-6">
      {/* Comment Form */}
      {currentUser ? (
        <div className="bg-white dark:bg-[#0F1014]  p-4">
          <CommentForm
            onSubmit={content => handleCommentSubmit(content)}
            placeholder="Share your thoughts..."
            buttonText="Send"
            // currentUser={currentUser}
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

      {/* Comments Header */}
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

      {/* Comments List */}
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
