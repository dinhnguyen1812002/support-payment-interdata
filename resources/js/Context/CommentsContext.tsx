import React, { createContext, useState, useContext, ReactNode } from 'react';
import {CommentsResponse, Comment} from "@/types/CommentTypes";


interface CommentsContextType {
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    nextPage: string | null;
    setNextPage: React.Dispatch<React.SetStateAction<string | null>>;
    addComment: (newComment: Comment) => void;
    removeComment: (commentId: number) => void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === newComment.parent_id) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment],
                        };
                    }
                    return comment;
                })
            );
        } else {
            setComments(prevComments => [{ ...newComment, replies: [] }, ...prevComments]);
        }
    };

    const removeComment = (commentId: number) => {
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
                setIsLoading
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
