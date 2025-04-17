import React from 'react';
import CommentItem from './CommentItem';
import {CommentsResponse, Comment, User} from "@/types/CommentTypes";

interface CommentListProps {
    comments: Comment[];
    onReply: (content: string, parentId?: number)  => void;
    currentUser: User | null;
    depth?: number;
}

const CommentList: React.FC<CommentListProps> = ({
                                                     comments,
                                                     onReply,
                                                     currentUser,
                                                     depth = 0
                                                 }) => {
    return (
        <div className="space-y-6">
            {comments.map(comment => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={onReply}
                    currentUser={currentUser}
                    depth={depth}
                />
            ))}
        </div>
    );
};

export default CommentList;
