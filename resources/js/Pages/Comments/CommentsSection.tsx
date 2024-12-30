import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Textarea } from '@/Components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface CommentFormProps {
    onSubmit: (content: string, parentId?: number) => void;
    currentUserAvatar: string;
    placeholder?: string;
    autoFocus?: boolean;
}

const CommentForm = ({
                         onSubmit,
                         currentUserAvatar,
                         placeholder = "Write a comment...",
                         autoFocus = false,
                     }: CommentFormProps) => {
    const [comment, setComment] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        onSubmit(comment);
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={currentUserAvatar} alt="Your avatar" />
                    <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        className="min-h-[100px] resize-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!comment.trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};



interface CommentItemProps {
    comment: Comment;
    onReply: (content: string, parentId: number) => void;
    currentUserAvatar: string;
    depth?: number;
}

const CommentItem = ({
                         comment,
                         onReply,
                         currentUserAvatar,
                         depth = 0,
                     }: CommentItemProps) => {
    const [isReplying, setIsReplying] = React.useState(false);
    const maxDepth = 3;

    const handleReply = (content: string) => {
        onReply(content, comment.id);
        setIsReplying(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex gap-4">

            <Avatar>
                <AvatarImage
                    src={
                        comment.user.profile_photo_path
                            ? `/storage/${comment.user.profile_photo_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&color=7F9CF5&background=EBF4FF`
                    }
                    alt={comment.user.name}
                />
                <AvatarFallback>
                    {comment.user.name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{comment.user.name}</span>
                            <time className="text-sm text-muted-foreground">

                                 {comment.created_at}
                            </time>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                    </CardContent>
                </Card>

                {depth < maxDepth && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Reply
                        </Button>
                    </div>
                )}

                {isReplying && (
                    <div className="ml-4">
                        <CommentForm
                            onSubmit={handleReply}
                            currentUserAvatar={currentUserAvatar}
                            placeholder="Write a reply..."
                            autoFocus
                        />
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className={cn("space-y-4", depth > 0 && "ml-4")}>
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                currentUserAvatar={currentUserAvatar}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

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
                    {initialComments.map((comment) => (
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
