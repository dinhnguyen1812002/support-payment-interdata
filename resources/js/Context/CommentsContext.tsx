import React, { createContext, useContext, useState, useCallback } from 'react';
import { CommentsResponse, Comment } from '@/types/CommentTypes';
import axios from 'axios';

interface CommentsContextType {
  comments: Comment[];
  nextPage: string | null;
  isLoading: boolean;
  hasMore: boolean;
  addComment: (comment: Comment) => void;
  addReply: (parentId: string, reply: Comment) => void;
  removeComment: (commentId: string) => void;
  loadMoreComments: () => void;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setNextPage: React.Dispatch<React.SetStateAction<string | null>>;
}

const CommentsContext = createContext<CommentsContextType | undefined>(
  undefined,
);

interface CommentsProviderProps {
  initialComments: CommentsResponse;
  postId: string;
  children: React.ReactNode;
}

export const CommentsProvider: React.FC<CommentsProviderProps> = ({
  initialComments,
  postId,
  children,
}) => {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.data || [],
  );
  const [nextPage, setNextPage] = useState<string | null>(
    initialComments.next_page_url,
  );
  const [isLoading, setIsLoading] = useState(false);

  const addComment = useCallback((comment: Comment) => {
    console.log('Adding comment to state:', comment);
    setComments(prev => {
      // Kiểm tra xem comment đã tồn tại chưa (bao gồm cả optimistic và real comments)
      const exists = prev.some(c => c.id === comment.id);
      if (exists) {
        console.log('Comment already exists, skipping:', comment.id);
        return prev;
      }

      // Kiểm tra xem có comment tạm thời nào trùng nội dung không
      const duplicateOptimistic = prev.find(c =>
        c.isOptimistic &&
        c.comment === comment.comment &&
        c.user.id === comment.user.id &&
        !comment.isOptimistic
      );

      if (duplicateOptimistic) {
        console.log('Replacing optimistic comment with real comment:', duplicateOptimistic.id, '->', comment.id);
        return prev.map(c => c.id === duplicateOptimistic.id ? comment : c);
      }

      return [comment, ...prev];
    });
  }, []);

  const addReply = useCallback((parentId: string, reply: Comment) => {
    console.log('Adding reply to parent:', parentId, reply);
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === parentId) {
          const existingReplies = comment.replies || [];

          // Check if reply already exists
          const exists = existingReplies.some(r => r.id === reply.id);
          if (exists) {
            console.log('Reply already exists, skipping:', reply.id);
            return comment;
          }

          // Check for optimistic reply to replace
          const duplicateOptimistic = existingReplies.find(r =>
            r.isOptimistic &&
            r.comment === reply.comment &&
            r.user.id === reply.user.id &&
            !reply.isOptimistic
          );

          if (duplicateOptimistic) {
            console.log('Replacing optimistic reply with real reply:', duplicateOptimistic.id, '->', reply.id);
            return {
              ...comment,
              replies: existingReplies.map(r => r.id === duplicateOptimistic.id ? reply : r),
            };
          }

          return {
            ...comment,
            replies: [...existingReplies, reply],
          };
        }
        return comment;
      }),
    );
  }, []);

  const removeComment = useCallback((commentId: string) => {
    setComments(prev =>
      prev
        .filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies:
            comment.replies?.filter(reply => reply.id !== commentId) || [],
        })),
    );
  }, []);

  const loadMoreComments = useCallback(async () => {
    if (!nextPage || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.get(nextPage);
      const newComments: Comment[] = response.data.comments.data;
      setComments(prev => [...prev, ...newComments]);
      setNextPage(response.data.comments.next_page_url);
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nextPage, isLoading]);

  const hasMore = !!nextPage;

  return (
    <CommentsContext.Provider
      value={{
        comments,
        nextPage,
        isLoading,
        hasMore,
        addComment,
        addReply,
        removeComment,
        loadMoreComments,
        setComments,
        setNextPage,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};
