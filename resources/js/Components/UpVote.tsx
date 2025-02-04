import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/Components/ui/sonner";
import { toast } from "sonner"
interface UpvoteProps {
    postId: string;
    initialUpvoteCount: number;
    initialIsUpvote: boolean;
}

const Upvote: React.FC<UpvoteProps> = ({ postId, initialUpvoteCount, initialIsUpvote }) => {
    const { post, processing } = useForm({});
    const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
    const [isUpvote, setIsUpvote] = useState(initialIsUpvote);

    const handleVote = async () => {
        if (processing) return;

        post(`/posts/${postId}/upvote`, {
            preserveScroll: true,
            onSuccess: () => {
                const newUpvoteState = !isUpvote;
                setIsUpvote(newUpvoteState);
                setUpvoteCount(prev => (newUpvoteState ? prev + 1 : prev - 1));
            },
        });
    };

    return (
        <div className="flex flex-col items-center gap-0">
            <Button
                onClick={handleVote}
                disabled={processing || isUpvote}
                variant="ghost"
                size="lg"
                className={cn(
                    "p-0 h-14 w-14",
                    isUpvote && "bg-blue-50 text-blue-500 hover:bg-blue-50",
                    !isUpvote && "text-gray-400 hover:text-blue-500 hover:bg-blue-50",
                    processing && "cursor-wait opacity-50"
                )}
                title={isUpvote ? "Đã upvote" : "Upvote bài viết"}
            >
                <Plus className="h-10 w-10" strokeWidth={2.5} />
            </Button>

            <span className={cn("text-lg font-semibold", isUpvote ? "text-blue-500" : "text-gray-600")}>
                {upvoteCount || 0}
            </span>

            <Button
                onClick={handleVote}
                disabled={processing || !isUpvote}
                variant="ghost"
                size="lg"
                className={cn(
                    "p-0 h-14 w-14 rounded-full",
                    isUpvote && "text-gray-400 hover:text-red-500 hover:bg-red-50",
                    !isUpvote && "text-gray-300 opacity-50",
                    processing && "cursor-wait opacity-50"
                )}
                title={isUpvote ? "Xóa upvote" : "Chưa upvote"}
            >
                <Minus className="h-10 w-10" strokeWidth={2.5} />
            </Button>
        </div>
    );
};

export default Upvote;
