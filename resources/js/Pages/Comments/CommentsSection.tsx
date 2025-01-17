import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import CommentForm from "@/Pages/Comments/CommentForm";
import CommentItem from "@/Pages/Comments/CommentItem";
import useTypedPage from "@/Hooks/useTypedPage";
import {getFirstTwoLetters} from "@/lib/utils";

interface User {
    id: number;
    name: string;
    profile_photo_path: string;
}


interface Comment {
    id: number;
    user: User;
    comment: string;
    created_at: string;
    parent_id?: number | null;
    replies?: Comment[];
}

interface CommentsSectionProps {
    initialComments: Comment[];
    onCommentSubmit: (content: string, parentId?: number) => void;
    currentUserAvatar: string;
}

const CommentsSection = ({
                             initialComments,
                             onCommentSubmit,
                             currentUserAvatar,
                         }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const page = useTypedPage();
    const name= getFirstTwoLetters(page.props.auth.user!.name);
    const addNewComment = (newComment: Comment) => {
        // If it's a reply (has parent_id), add it to the appropriate parent comment
        if (newComment.parent_id) {
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === newComment.parent_id) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    }
                    return comment;
                })
            );
        } else {
            // If it's a root comment, add it to the main list
            setComments(prevComments => [...prevComments, {...newComment, replies: []}]);
        }
    };

    useEffect(() => {
        // Ensure Echo is properly initialized
        if (typeof window.Echo === 'undefined') {
            console.error('Echo is not initialized');
            return;
        }

        const channel = window.Echo.channel('comments-channel');

        channel.listen('.comment.posted', (event: { comment: Comment }) => {
            console.log('Received comment:', event.comment);
            addNewComment(event.comment);
        });

        return () => {
            channel.stopListening('.comment.posted');
            window.Echo.leaveChannel('comments-channel');
        };
    }, []);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/*<CommentForm*/}
                {/*    onSubmit={(content) => onCommentSubmit(content)}*/}
                {/*    currentUserAvatar={currentUserAvatar}*/}
                {/*/>*/}
                <CommentForm
                    onSubmit={(content) => onCommentSubmit(content)}
                    currentUserAvatar={page.props.auth.user?.profile_photo_path || ""}
                />
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={onCommentSubmit}
                            currentUserAvatar={currentUserAvatar}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CommentsSection;
