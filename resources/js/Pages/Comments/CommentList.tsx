import React from 'react';
import CommentItem from './CommentItem';
import { CommentsResponse, Comment, User } from '@/types/CommentTypes';

interface CommentListProps {
  comments: Comment[];
  onReply: (content: string, parentId: string) => void; // Fixed: consistent number type
  currentUser: User | null;
  depth?: number;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onReply,
  currentUser,
  depth = 0,
}) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => {
        // Ensure comment.id is properly handled
        // const commentId = typeof comment.id === 'string' ? comment.id : comment.id.toString();

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={onReply}
            currentUser={currentUser}
            depth={depth}
          />
        );
      })}
    </div>
  );
};

export default CommentList;
