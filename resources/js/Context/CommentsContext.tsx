import React, { createContext, useContext, useState, useCallback } from 'react';
import { CommentsResponse, Comment } from '@/types/CommentTypes';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface CommentsContextType {
  comments: Comment[];
  pagination: CommentsResponse | null;
  isLoading: boolean;
  addComment: (comment: Comment) => void;
  addReply: (parentId: string, reply: Comment) => void;
  removeComment: (commentId: string) => void;
  loadPage: (page: number) => void;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setPagination: React.Dispatch<React.SetStateAction<CommentsResponse | null>>;
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
  const [pagination, setPagination] = useState<CommentsResponse | null>(
    initialComments,
  );
  const [isLoading, setIsLoading] = useState(false);

  const addComment = useCallback((comment: Comment) => {
    // console.log('Adding comment to state:', comment.id, comment.content.substring(0, 50));
    setComments(prev => {
      // Kiểm tra xem comment đã tồn tại chưa
      const exists = prev.some(c => c.id === comment.id);
      if (exists) {
        // console.log('Comment already exists, skipping:', comment.id);
        return prev;
      }

      return [comment, ...prev];
    });
  }, []);

  const addReply = useCallback((parentId: string, reply: Comment) => {
    // console.log('Adding reply to parent:', parentId, reply.id, reply.content.substring(0, 50));
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === parentId) {
          const existingReplies = comment.replies || [];

          // Check if reply already exists
          const exists = existingReplies.some(r => r.id === reply.id);
          if (exists) {
            // console.log('Reply already exists, skipping:', reply.id);
            return comment;
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

  const loadPage = useCallback(async (page: number) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Sử dụng router.get để navigate với preserveScroll
      router.get(window.location.pathname,
        {
          ...Object.fromEntries(new URLSearchParams(window.location.search)),
          page: page
        },
        {
          preserveScroll: true,
          preserveState: true,
          only: ['comments'], // Chỉ reload comments
          onSuccess: (page) => {
            if (page.props.comments) {
              const newCommentsResponse = page.props.comments as CommentsResponse;
              setComments(newCommentsResponse.data || []);
              setPagination(newCommentsResponse);
            }
          },
          onError: (error) => {
            console.error('Error loading comments page:', error);
          },
          onFinish: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error loading comments page:', error);
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <CommentsContext.Provider
      value={{
        comments,
        pagination,
        isLoading,
        addComment,
        addReply,
        removeComment,
        loadPage,
        setComments,
        setPagination,
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
