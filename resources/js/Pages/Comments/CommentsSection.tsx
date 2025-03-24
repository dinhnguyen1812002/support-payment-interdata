import React, { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';



import { Loader2 } from 'lucide-react';
import {CommentsProvider, useComments} from '@/Context/CommentsContext';

import {CommentsResponse, Comment, User} from "@/types/CommentTypes";
import CommentList from "@/Pages/Comments/CommentList";
import CommentForm from "@/Pages/Comments/CommentForm";

interface CommentsSectionProps {
    initialComments: CommentsResponse;
    onCommentSubmit: (content: string, parentId?: number) => void;
    postId: string;
    currentUser: User | null;
}

const CommentsContent: React.FC<Omit<CommentsSectionProps, 'initialComments'>> = ({
                                                                                      onCommentSubmit,
                                                                                      postId,
                                                                                      currentUser
                                                                                  }) => {
    const { comments, nextPage, setComments, setNextPage, isLoading, addComment } = useComments();

    const fetchMoreComments = async () => {
        if (!nextPage || isLoading) return;

        try {
            const response = await fetch(nextPage);
            const data = await response.json();

            setComments(prev => [...prev, ...data.data]);
            setNextPage(data.next_page_url);
        } catch (error) {
            console.error("Error loading more comments:", error);
        }
    };

    // Listen for real-time comments via Laravel Echo
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel(`post.${postId}.comments`);

        channel.listen('.NewCommentPosted', (event: { comment: Comment }) => {
            setComments(prevComments => {
                if (!prevComments.some(comment => comment.id === event.comment.id)) {
                    addComment(event.comment);
                }
                return prevComments;
            });
        });

        return () => {
            channel.stopListening('.NewCommentPosted');
            window.Echo.leaveChannel(`post.${postId}.comments`);
        };
    }, [postId, setComments]);

    const commentCount = comments.length;

    return (
        <div className="w-full space-y-6">
            {currentUser ? (
                <CommentForm onSubmit={content => onCommentSubmit(content)} />
            ) : (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-700 dark:text-gray-300">Sign in to leave a comment</p>
                </div>
            )}

            <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Comments
                </h2>
                <span className="ml-2 text-base font-semibold text-gray-500 dark:text-gray-400">
          ({commentCount})
        </span>
            </div>

            {commentCount === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Be the first to comment!</p>
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchMoreComments}
                    hasMore={!!nextPage}
                    loader={
                        <div className="py-4 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    }
                    endMessage={
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No more comments to load
                        </div>
                    }
                >
                    <CommentList comments={comments} onReply={onCommentSubmit} currentUser={currentUser} />
                </InfiniteScroll>
            )}
        </div>
    );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ initialComments, ...props }) => {
    return (
        <CommentsProvider initialComments={initialComments}>
            <CommentsContent {...props} />
        </CommentsProvider>
    );
};

export default CommentsSection;
