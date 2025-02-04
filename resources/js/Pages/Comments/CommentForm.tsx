import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Send, Image, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import useTypedPage from "@/Hooks/useTypedPage";
import {getFirstTwoLetters} from "@/lib/utils";



interface CommentFormProps {
    onSubmit: (content: string, parentId?: number, image?: File | null) => void;
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
    const [comment, setComment] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const page = useTypedPage();
    // Handle Emoji Selection
    const handleEmojiClick = (emojiObject: any) => {
        setComment((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };
    const name= getFirstTwoLetters(page.props.auth.user!.name);
    // Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() && !selectedImage) return;

        // Pass content and image to the parent onSubmit
        onSubmit(comment, undefined, selectedImage);

        setComment("");
        setSelectedImage(null);
        setImagePreview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={
                            currentUserAvatar
                                ? `/storage/${currentUserAvatar}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&color=7F9CF5&background=EBF4FF`
                        }
                        alt="{${page.props.auth.user?.name}}"
                    />
                    <AvatarFallback>Your</AvatarFallback>
                </Avatar>


                {/* Comment Input Area */}
                <div className="flex-1 space-y-2 relative">
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        className="min-h-[100px] resize-none"
                    />

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="absolute z-10 bottom-full left-0 mb-2">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}

                            />
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mt-2 relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Emoji Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                            >
                                <Smile className="w-5 h-5" />
                            </Button>

                            {/* Image Upload Button */}
                            {/* <label htmlFor="image-upload" className="cursor-pointer">
                                <Image className="w-5 h-5" />
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label> */}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" disabled={!comment.trim() && !selectedImage}>
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
