import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import CommentForm from "@/Pages/Comments/CommentForm";
import CommentItem from "@/Pages/Comments/CommentItem";
import useTypedPage from "@/Hooks/useTypedPage";
import { getFirstTwoLetters } from "@/lib/utils";
import { User } from "@/types";

interface Comment {
    id: number;
    user: User;
    comment: string;
    created_at: string;
    parent_id?: number | null;
    replies?: Comment[];
}

interface CommentsSectionProps {
    initialComments: { data: Comment[], next_page_url: string | null };
    onCommentSubmit: (content: string, parentId?: number) => void;
    currentUserAvatar: string;
}

const CommentsSection = ({ initialComments, onCommentSubmit, currentUserAvatar }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>(initialComments.data);
    const [nextPage, setNextPage] = useState<string | null>(initialComments.next_page_url);
    const page = useTypedPage();
    const user = page.props.auth.user;
    const name = user ? getFirstTwoLetters(user.name) : "";
    let commentCount = comments.length;
    // Thêm bình luận mới vào danh sách
    const addNewComment = (newComment: Comment) => {
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

    // Fetch thêm comment khi cuộn xuống
    const fetchMoreComments = async () => {
        if (!nextPage) return;

        try {
            const response = await fetch(nextPage);
            const data = await response.json();

            setComments(prev => [...prev, ...data.data]);
            setNextPage(data.next_page_url);
        } catch (error) {
            console.error("Error loading more comments:", error);
        }
    };

    return (
        <div className="w-full">

            <div className="space-y-6">
                {user ? (
                    <CommentForm
                        onSubmit={content => onCommentSubmit(content)}

                    />
                ) : (
                    <p>Đăng nhập để bình luận</p>
                )}
                <h2  className=" text-2xl font-bold text-gray-900 mb-10 hover:text-gray-700">
                    Replies
                    <small className="text-mutedText text-base font-semibold ml-1">({commentCount})</small>
                </h2>
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchMoreComments}
                    hasMore={!!nextPage}
                    loader={<p>Đang tải thêm bình luận...</p>}

                >
                    <div className="space-y-6">
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={onCommentSubmit}
                                currentUserAvatar={
                                    comment.user.profile_photo_path
                                        ? `/storage/${comment.user.profile_photo_path}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&color=7F9CF5&background=EBF4FF`
                                }
                            />
                        ))}
                    </div>
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default CommentsSection;
