import React, { createContext, useState, useContext, ReactNode } from 'react';
import {CommentsResponse, Comment} from "@/types/CommentTypes";


interface CommentsContextType {
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    nextPage: string | null;
    setNextPage: React.Dispatch<React.SetStateAction<string | null>>;
    addComment: (newComment: Comment) => void;
    removeComment: (commentId: string) => void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addReply : ( parentId :string, newComment: Comment) => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const CommentsProvider: React.FC<{
    children: ReactNode;
    initialComments: CommentsResponse;
}> = ({ children, initialComments }) => {
    const [comments, setComments] = useState<Comment[]>(initialComments.data);
    const [nextPage, setNextPage] = useState<string | null>(initialComments.next_page_url);
    const [isLoading, setIsLoading] = useState(false);

    const addComment = (newComment: Comment) => {
        if (newComment.parent_id) {
            setComments((prev) => {
                const index = prev.findIndex((comment) => comment.id === newComment.parent_id);
                if (index !== -1) {
                    const newComments = [...prev];
                    newComments.splice(index + 1, 0, newComment);
                    return newComments;
                } else {
                    // Nếu không tìm thấy parentId, thêm bình luận vào cuối danh sách
                    return [...prev, newComment];
                }
            });
        } else {
            // Thêm bình luận vào đầu danh sách nếu không có parentId
            setComments((prev) => [newComment, ...prev]);
        }
    };
    const addReply = (parentId: string, reply: Comment) => {
        setComments(prevComments => {
            return prevComments.map(comment => {
                if (comment.id === parentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), reply]
                    };
                } else if (comment.replies && comment.replies.length > 0) {
                    // Check for the parent in nested replies
                    return {
                        ...comment,
                        replies: addReplyToNestedComments(comment.replies, parentId, reply)
                    };
                }
                return comment;
            });
        });
    };

// Helper function to handle nested replies
    const addReplyToNestedComments = (replies: Comment[], parentId: string, newReply: Comment): Comment[] => {
        return replies.map(reply => {
            if (reply.id === parentId) {
                return {
                    ...reply,
                    replies: [...(reply.replies || []), newReply]
                };
            } else if (reply.replies && reply.replies.length > 0) {
                return {
                    ...reply,
                    replies: addReplyToNestedComments(reply.replies, parentId, newReply)
                };
            }
            return reply;
        });
    };
    const removeComment = (commentId: string) => {
        // Remove comment directly if it's a top-level comment
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

        // Also check and remove from replies
        setComments(prevComments =>
            prevComments.map(comment => {
                if (comment.replies?.some(reply => reply.id === commentId)) {
                    return {
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== commentId)
                    };
                }
                return comment;
            })
        );
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
                addReply
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
