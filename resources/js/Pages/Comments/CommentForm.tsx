import React from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/ui/avatar";
import {Textarea} from "@/Components/ui/textarea";
import {Button} from "@/Components/ui/button";
import {Send} from "lucide-react";
import CommentsSection from "@/Pages/Comments/CommentsSection";
interface CommentFormProps {
    onSubmit: (content: string, parentId?: number) => void;
    currentUserAvatar: string;
    placeholder?: string;
    autoFocus?: boolean;
}
const CommentForm: React.FC<CommentFormProps> = ({
                                                     onSubmit,
                                                     currentUserAvatar,
                                                     placeholder = "Write a comment...",
                                                     autoFocus = false,
                                                 }) => {
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

export default CommentForm;
