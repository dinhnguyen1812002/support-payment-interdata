import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CommentsResponse, Comment } from '@/types/CommentTypes';

interface CommentsContextType {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  nextPage: string | null;
  setNextPage: React.Dispatch<React.SetStateAction<string | null>>;
  addComment: (newComment: Comment) => void;
  removeComment: (commentId: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addReply: (parentId: string, newComment: Comment) => void;
  updateComment: (commentId: string, updatedComment: Partial<Comment>) => void;
  loadMoreComments: () => Promise<void>;
  hasMore: boolean;
}

const CommentsContext = createContext<CommentsContextType | undefined>(
  undefined,
);

export const CommentsProvider: React.FC<{
  children: ReactNode;
  initialComments: CommentsResponse;
  postId: string;
}> = ({ children, initialComments, postId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments.data);
  const [nextPage, setNextPage] = useState<string | null>(
    initialComments.next_page_url,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialComments.next_page_url);

  const addComment = (newComment: Comment) => {
    setComments(prev => {
      // Check if comment already exists to prevent duplicates
      const exists = prev.some(comment => comment.id === newComment.id);
      if (exists) return prev;

      if (newComment.parent_id) {
        // This is a reply, add it to the appropriate parent's replies
        return prev.map(comment => {
          if (comment.id === newComment.parent_id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            };
          }
          return comment;
        });
      } else {
        // This is a top-level comment, add it to the beginning
        return [newComment, ...prev];
      }
    });
  };

  const addReply = (parentId: string, reply: Comment) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === parentId) {
          // Check if reply already exists
          const replyExists = comment.replies?.some(r => r.id === reply.id);
          if (replyExists) return comment;

          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        } else if (comment.replies && comment.replies.length > 0) {
          // Check for the parent in nested replies
          const updatedReplies = addReplyToNestedComments(
            comment.replies,
            parentId,
            reply,
          );
          // Only update if a change was made
          if (
            JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)
          ) {
            return {
              ...comment,
              replies: updatedReplies,
            };
          }
        }
        return comment;
      });
    });
  };

  // Helper function to handle nested replies
  const addReplyToNestedComments = (
    replies: Comment[],
    parentId: string,
    newReply: Comment,
  ): Comment[] => {
    return replies.map(reply => {
      if (reply.id === parentId) {
        // Check if reply already exists
        const replyExists = reply.replies?.some(r => r.id === newReply.id);
        if (replyExists) return reply;

        return {
          ...reply,
          replies: [...(reply.replies || []), newReply],
        };
      } else if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: addReplyToNestedComments(reply.replies, parentId, newReply),
        };
      }
      return reply;
    });
  };

  const removeComment = (commentId: string) => {
    setComments(prevComments => {
      // Remove from top-level comments
      const filteredComments = prevComments.filter(
        comment => comment.id !== commentId,
      );

      // Remove from replies recursively
      return filteredComments.map(comment => ({
        ...comment,
        replies: removeFromReplies(comment.replies || [], commentId),
      }));
    });
  };

  // Helper function to remove from nested replies
  const removeFromReplies = (
    replies: Comment[],
    commentId: string,
  ): Comment[] => {
    return replies
      .filter(reply => reply.id !== commentId)
      .map(reply => ({
        ...reply,
        replies: removeFromReplies(reply.replies || [], commentId),
      }));
  };

  const updateComment = (
    commentId: string,
    updatedComment: Partial<Comment>,
  ) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, ...updatedComment };
        }
        // Check in replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateInReplies(
              comment.replies,
              commentId,
              updatedComment,
            ),
          };
        }
        return comment;
      });
    });
  };

  // Helper function to update in nested replies
  const updateInReplies = (
    replies: Comment[],
    commentId: string,
    updatedComment: Partial<Comment>,
  ): Comment[] => {
    return replies.map(reply => {
      if (reply.id === commentId) {
        return { ...reply, ...updatedComment };
      }
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: updateInReplies(reply.replies, commentId, updatedComment),
        };
      }
      return reply;
    });
  };

  const loadMoreComments = async () => {
    if (!nextPage || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(nextPage);
      const data = await response.json();

      setComments(prev => [...prev, ...data.data]);
      setNextPage(data.next_page_url);
      setHasMore(!!data.next_page_url);
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        setComments,
        nextPage,
        setNextPage,
        addComment,
        removeComment,
        isLoading,
        setIsLoading,
        addReply,
        updateComment,
        loadMoreComments,
        hasMore,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
