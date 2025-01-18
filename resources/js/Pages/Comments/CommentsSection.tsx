import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import CommentForm from "@/Pages/Comments/CommentForm";
import CommentItem from "@/Pages/Comments/CommentItem";
import useTypedPage from "@/Hooks/useTypedPage";
import {getFirstTwoLetters} from "@/lib/utils";
import {forEach} from "lodash";

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
    const user = page.props.auth.user; // Lưu user vào biến để tránh truy cập lặp lại
    const name = user ? getFirstTwoLetters(user.name) : ""; // Kiểm tra user trước khi truy cập name

    const addNewComment = (newComment: Comment) => {
        if (newComment.parent_id) {
            setComments((prevComments) =>
                prevComments.map((comment) => {
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
            setComments((prevComments) => [
                ...prevComments,
                { ...newComment, replies: [] },
            ]);
        }
    };

    useEffect(() => {
        if (typeof window.Echo === "undefined") {
            console.error("Echo is not initialized");
            return;
        }

        const channel = window.Echo.channel("comments-channel");

        channel.listen(".comment.posted", (event: { comment: Comment }) => {
            console.log("Received comment:", event.comment);
            addNewComment(event.comment);
        });

        return () => {
            channel.stopListening(".comment.posted");
            window.Echo.leaveChannel("comments-channel");
        };
    }, []);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {user ? (
                    <CommentForm
                        onSubmit={(content) => onCommentSubmit(content)}
                        currentUserAvatar={
                            user.profile_photo_path || // Dùng avatar từ user nếu có
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                name
                            )}&color=7F9CF5&background=EBF4FF`
                        }
                    />
                ) : (
                    <p>Please log in to add a comment.</p> // Hiển thị thông báo nếu không đăng nhập
                )}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={onCommentSubmit}
                            currentUserAvatar={
                                comment.user.profile_photo_path
                                    ? `/storage/${comment.user.profile_photo_path}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        comment.user.name
                                    )}&color=7F9CF5&background=EBF4FF`
                            }
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export default CommentsSection;
