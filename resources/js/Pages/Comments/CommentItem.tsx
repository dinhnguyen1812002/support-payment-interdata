import React from "react";
import useTypedPage from "@/Hooks/useTypedPage";
import {router} from "@inertiajs/react";
import {cn, formatDate, getFirstTwoLetters} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/ui/avatar";
import {Card, CardContent} from "@/Components/ui/card";
import {Button} from "@/Components/ui/button";
import {MessageCircle, Trash2} from "lucide-react";
import CommentForm from "@/Pages/Comments/CommentForm";
import {User} from "@/types";


interface CommentItemProps {
    comment: Comment;
    onReply: (content: string, parentId: number) => void;
    currentUserAvatar: string;
    depth?: number;
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

    const name= getFirstTwoLetters(comment.user.name);
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
            {/*<Avatar className="h-8 w-8">*/}
            {/*    <AvatarImage*/}
            {/*        src={*/}
            {/*            comment.user.profile_photo_path*/}
            {/*                ? `/storage/${comment.user.profile_photo_path}`*/}
            {/*                : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&color=7F9CF5&background=EBF4FF`*/}
            {/*        }*/}
            {/*        alt={comment.user.name}*/}
            {/*    />*/}
            {/*    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>*/}
            {/*</Avatar>*/}
            <div className="flex-1 space-y-4 dark:bg-[#0F1014]">
                <Card>
                    <CardContent className="relative pt-4">
                        {/* User & Avatar Section */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                {/* Avatar */}
                                <Avatar className="h-9 w-9 rounded-md">
                                    <AvatarImage
                                        src={
                                            comment.user.profile_photo_path
                                                ? `/storage/${comment.user.profile_photo_path}`
                                                : `https://ui-avatars.com/api/?name=${encodeURI(comment.user.name)}&color=7F9CF5&background=EBF4FF`
                                        }
                                        alt={comment.user.name}
                                    />
                                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex flex-col justify-center">
                                    <h3 className="text-gray-800 text-sm font-semibold leading-tight mb-0.5 dark:text-mutedText">{comment.user.name}</h3>
                                    <p className="text-xs text-mutedText font-semibold leading-tight">{comment.created_at}</p>
                                </div>
                            </div>

                            {/* Buttons (Top Right) */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="p-1"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-600 p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Comment Content with Extra Space from Avatar */}
                        <p className="text-sm mt-3">{comment.comment}</p>
                    </CardContent>
                </Card>


                {/*<div className="flex items-center gap-2">*/}
                {/*    <Button*/}
                {/*        variant="ghost"*/}
                {/*        size="sm"*/}
                {/*        onClick={() => setIsReplying(!isReplying)}*/}
                {/*    >*/}
                {/*        <MessageCircle className="w-4 h-4 mr-2"/>*/}
                {/*        Reply*/}
                {/*    </Button>*/}

                {/*    <Button*/}
                {/*        variant="outline"*/}
                {/*        size="sm"*/}
                {/*        onClick={() => deleteComment(comment.id)}*/}
                {/*        className="text-red-500 hover:text-red-600"*/}
                {/*    >*/}
                {/*        <Trash2 className="w-4 h-4 mr-2"/>*/}

                {/*    </Button>*/}
                {/*</div>*/}

                {isReplying && (
                    <div className="ml-4">
                        <CommentForm
                            onSubmit={handleReply}
                            placeholder="Write a reply..."
                            autoFocus
                        />
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                   <div className="space-y-4">
                      {comment.replies?.map((reply) => (
                            <CommentItem
                             key={reply.id}
                               comment={reply}
                              onReply={onReply}
                             currentUserAvatar={reply.user.profile_photo_path
                                 ? `/storage/${reply.user.profile_photo_path}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.name)}&color=7F9CF5&background=EBF4FF`}
                          />
                       ))}
                   </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
