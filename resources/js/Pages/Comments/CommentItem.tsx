import React from "react";
import useTypedPage from "@/Hooks/useTypedPage";
import {router} from "@inertiajs/react";
import {cn} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/ui/avatar";
import {Card, CardContent} from "@/Components/ui/card";
import {Button} from "@/Components/ui/button";
import {MessageCircle, Trash2} from "lucide-react";
import CommentForm from "@/Pages/Comments/CommentForm";
interface CommentItemProps {
    comment: Comment;
    onReply: (content: string, parentId: number) => void;
    currentUserAvatar: string;
    depth?: number;
}
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
const CommentItem: React.FC<CommentItemProps> = ({
                                                     comment,
                                                     onReply,
                                                     currentUserAvatar,
                                                     depth = 0,
                                                 }) => {
    const [isReplying, setIsReplying] = React.useState(false);
    const page = useTypedPage();

    const handleReply = (content: string) => {
        onReply(content, comment.id);
        setIsReplying(false);
    };

    const deleteComment = (id: number) => {
        router.delete(`/comments/${id}`, {
            onSuccess: () => {
                alert("Comment deleted successfully");
            },
            onError: (errors: any) => {
                alert("Error deleting comment");
            },
        });
    };

    return (
        <div className={cn("flex gap-4", depth > 0 && `ml-${depth * 4}`)}>
            <Avatar className="h-8 w-8">
                <AvatarImage
                    src={
                        comment.user.profile_photo_path
                            ? `/storage/${comment.user.profile_photo_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&color=7F9CF5&background=EBF4FF`
                    }
                    alt={comment.user.name}
                />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{comment.user.name}</span>
                            <time className="text-sm text-muted-foreground">{comment.created_at}</time>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Reply
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-500 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>

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
                    <div className="space-y-4">
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

export default CommentItem;
