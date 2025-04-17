import React, { useState, useRef } from 'react';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Send, Smile,SendHorizontal } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import {useComments} from "@/Context/CommentsContext";


import { Separator } from "@/Components/ui/separator"
interface CommentFormProps {
    onSubmit: (content: string) => void;
    placeholder?: string;
    buttonText?: string;
    autoFocus?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
                                                     onSubmit,
                                                     placeholder = "Write your comment here...",
                                                     buttonText = "Send",
                                                     autoFocus = false,
                                                 }) => {
    const [comment, setComment] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { isLoading, setIsLoading } = useComments();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle Emoji Selection
    const handleEmojiClick = (emojiObject: any) => {
        setComment((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        // Focus back on textarea after emoji selection
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || isLoading) return;

        setIsLoading(true);
        onSubmit(comment);
        setComment("");
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2 relative">

                <Textarea
                    ref={textareaRef}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="min-h-24 resize-none focus:ring-2 focus:ring-blue-500 dark:bg-[#15171C] dark:text-gray-100"
                    disabled={isLoading}

                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <Smile className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="p-0 border-none w-auto"
                                side="top"
                                sideOffset={5}
                            >
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        type="submit"
                        disabled={!comment.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Posting...</span>
                            </div>
                        ) : (
                            <>
                                {/*<Send className="w-4 h-4 mr-2" />*/}
                                <SendHorizontal />
                                <Separator orientation="vertical" className="text-white border-white mx-2"/>
                                {buttonText}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default CommentForm;
