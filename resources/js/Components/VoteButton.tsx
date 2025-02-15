import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip"
import { Button } from "@/Components/ui/button";

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
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationType, setAnimationType] = useState<'increment' | 'decrement' | null>(null);

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setAnimationType(null);
            }, 300); // Match this with CSS animation duration
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    const toggleUpvote = () => {
        if (loading) return;
        setLoading(true);

        // Set animation type based on current state
        setAnimationType(hasUpvoted ? 'decrement' : 'increment');
        setIsAnimating(true);

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

    const getCountClassName = () => {
        let baseClass = "ml-1 transition-all duration-300 inline-block";

        if (isAnimating) {
            if (animationType === 'increment') {
                return `${baseClass} animate-upvote text-green-500`;
            }
            if (animationType === 'decrement') {
                return `${baseClass} animate-downvote text-gray-600`;
            }
        }

        return `${baseClass} ${hasUpvoted ? 'text-green-500' : 'text-gray-600'}`;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="secondary"
                        onClick={toggleUpvote}
                        className={`flex items-center transition gap-1 ${
                            hasUpvoted ? "text-green-500" : "text-gray-600 hover:text-gray-600"
                        }`}
                        disabled={loading}
                    >
                        <ArrowUp
                            className={`w-5 h-5 transition ${
                                hasUpvoted ? "text-green-500" : "text-gray-600"
                            } ${loading ? "opacity-50" : ""}`}
                        />
                        <span className={getCountClassName()}>
                            {upvotes}
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {hasUpvoted ? "Bỏ vote bài viết này" : "upvote bài viết này"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default UpvoteButton;
