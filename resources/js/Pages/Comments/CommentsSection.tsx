import React, { useRef, useCallback, useEffect } from 'react';
import { CommentsProvider, useComments } from '@/Context/CommentsContext';
import { CommentsResponse, Comment, User } from '@/types/CommentTypes';
import CommentList from '@/Pages/Comments/CommentList';
import CommentForm from '@/Pages/Comments/CommentForm';

interface CommentsSectionProps {
  initialComments: CommentsResponse;
  onCommentSubmit: (content: string, parentId?: string) => void;
  postId: string;
  currentUser: User | null;
}

const CommentsContent: React.FC<
  Omit<CommentsSectionProps, 'initialComments'>
> = ({ onCommentSubmit, postId, currentUser }) => {
  const {
    comments,
    addComment,
    addReply,
  } = useComments();

  const submittingRef = useRef<boolean>(false);
  const channelRef = useRef<any>(null);

  // Thêm useEffect để debug comments state

  const handleCommentSubmit = useCallback(
    (content: string, parentId?: string) => {
      if (!currentUser || submittingRef.current) return;

      // Prevent duplicate submissions
      submittingRef.current = true;

      try {
        onCommentSubmit(content, parentId);
      } catch (error) {
        console.error('Error submitting comment:', error);
      } finally {
        // Reset submission flag after a delay to prevent rapid submissions
        setTimeout(() => {
          submittingRef.current = false;
        }, 1000);
      }
    },
    [onCommentSubmit, currentUser],
  );

  // Simple real-time updates without optimistic UI
  useEffect(() => {
    if (!window.Echo || !postId) return;

    const channelName = `post.${postId}`;
    // console.log('Setting up Echo channel:', channelName);

    try {
      const channel = window.Echo.channel(channelName);
      channelRef.current = channel;

      const handleCommentPosted = (e: { comment: Comment }) => {
        // console.log('New comment received from other user:', e.comment);

        // Add comment via context
        if (e.comment.parent_id) {
          addReply(e.comment.parent_id, e.comment);
        } else {
          addComment(e.comment);
        }
      };

      // Listen for real-time events
      channel.listen('.CommentPosted', handleCommentPosted);

      return () => {
        // console.log('Cleaning up Echo channel:', channelName);
        if (channelRef.current) {
          channelRef.current.stopListening('.CommentPosted');
        }
        channelRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up Echo channel:', error);
    }
  }, [postId, currentUser, addComment, addReply]);



  const commentCount = comments?.length || 0;
  const hasComments = commentCount > 0;

  return (
    <div className="w-full space-y-6">
      {currentUser ? (
        <div className=" p-4">
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


      </div>

      {!hasComments ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Be the first to share your thoughts and start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <CommentList
            comments={comments}
            onReply={handleCommentSubmit}
            currentUser={currentUser}
          />
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
