import React, { useState } from 'react';
import {ArrowUp, ThumbsUp} from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"




interface UpvoteButtonProps {
    postId: string;
    initialUpvotes: number;
    initialHasUpvoted: boolean;
}
interface PostData {
    upvotes_count: number;
    has_upvoted: boolean;
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({
                                                       postId,
                                                       initialUpvotes,
                                                       initialHasUpvoted,
                                                   }) => {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
    const [loading, setLoading] = useState(false);

    const toggleUpvote = () => {
        if (loading) return;
        setLoading(true);

        router.post(
            `/posts/${postId}/upvote`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedPost = page.props.post as PostData;
                    setUpvotes(updatedPost.upvotes_count);
                    setHasUpvoted(updatedPost.has_upvoted);
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={toggleUpvote}
                        className={`flex items-center transition ${
                            hasUpvoted ? "text-green-500" : "text-gray-600 hover:text-gray-600"
                        }`}
                    >
                        <ArrowUp className={`w-5 h-5 transition ${hasUpvoted ? " text-green-500" : "text-gray-600"}`} />

                        <span>{upvotes}</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    {hasUpvoted ? "Bỏ vote bài viết này" : "upvote bài viết này"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default UpvoteButton;
