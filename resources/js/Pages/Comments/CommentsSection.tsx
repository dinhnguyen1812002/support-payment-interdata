import React, {useEffect, useState} from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

import CommentForm from "@/Pages/Comments/CommentForm";
import CommentItem from "@/Pages/Comments/CommentItem";

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

    useEffect(() => {
        const channel = window.Echo.channel('comments-channel');

        channel.listen('.comment.posted', (event: { comment: Comment }) => {
            console.log('Received event:', event);
            setComments((prevComments) => [...prevComments, event.comment]);
        });

        return () => {
            window.Echo.leaveChannel('comments-channel');
        };
    }, []);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <CommentForm
                    onSubmit={(content) => onCommentSubmit(content)}
                    currentUserAvatar={currentUserAvatar}
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
