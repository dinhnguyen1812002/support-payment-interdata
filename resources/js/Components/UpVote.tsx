import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface UpvoteProps {
    postId: string;
    upvotes_count: number;
    isUpvoted: boolean;
}

const Upvote: React.FC<UpvoteProps> = ({ postId, upvotes_count, isUpvoted }) => {
    const { post, processing } = useForm({});

    const handleUpvote = (action: 'upvote' | 'remove') => {
        if (processing) return;

        if ((action === 'upvote' && isUpvoted) || (action === 'remove' && !isUpvoted)) {
            return;
        }

        post(`/posts/${postId}/upvote`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => handleUpvote('upvote')}
                disabled={processing}
                className={cn(
                    "p-0 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200",
                    isUpvoted && "text-green-500 bg-green-50 hover:bg-green-100",
                    !isUpvoted && "text-gray-400 hover:text-green-600 hover:bg-green-50",
                    processing && "cursor-wait opacity-50"
                )}
                title={isUpvoted ? "Already upvoted" : "Upvote this post"}
            >
                <ChevronUp className="h-12 w-12" strokeWidth={2.5} />
            </button>

            <span className={cn(
                "text-xl font-semibold",
                isUpvoted ? "text-green-500" : "text-gray-600"
            )}>
                {upvotes_count || 0}
            </span>

            <button
                onClick={() => handleUpvote('remove')}
                disabled={processing || !isUpvoted}
                className={cn(
                    "p-0 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200",
                    isUpvoted && "text-gray-400 hover:text-red-500 hover:bg-red-50",
                    !isUpvoted && "text-gray-300 opacity-50",
                    processing && "cursor-wait opacity-50"
                )}
                title={isUpvoted ? "Remove your upvote" : "Cannot remove - not upvoted"}
            >
                <ChevronDown className="h-12 w-12" strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default Upvote;
