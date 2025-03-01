import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Link } from "@inertiajs/react";
import useTypedPage from "@/Hooks/useTypedPage";
import { Clock, PenLine, PlusCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { BlogPost } from "@/types";
import { generateSlug } from "@/Utils/slugUtils";
import UpvoteButton from "@/Components/VoteButton";
import { route } from "ziggy-js";
import { cn } from "@/lib/utils";

interface BlogCardProps {
    posts: BlogPost[];
    postCount: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ posts = [], postCount }) => {
    const page = useTypedPage();
    const isAuthenticated = !!page.props.auth.user;
    const [sort, setSort] = useState("latest");

    if (posts.length === 0) {
        return (
            <div className="text-center p-4 md:p-8">
                <div className="space-y-1">
                    <h2 className={cn(
                        "text-xl md:text-2xl font-bold tracking-tight",
                        "text-gray-900 dark:text-gray-100"
                    )}>
                        Tất cả câu hỏi
                        <span className="text-gray-500 dark:text-gray-400 pl-2">({postCount})</span>
                    </h2>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen flex flex-col flex-1 dark:bg-gray-900">
            <div className="flex justify-between items-center flex-wrap mb-8 lg:mb-7">
                {/* Header Section */}
                <div className="space-y-1">
                    <span className={cn(
                        "font-bold text-2xl text-customBlue",
                        "dark:text-blue-300"
                    )}>
                        All Questions
                        <small className={cn(
                            "text-mutedText text-base font-semibold ml-1",
                            "dark:text-gray-400"
                        )}>({postCount})</small>
                    </span>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {isAuthenticated ? (
                        <Link href={route('posts.create')} className="w-full sm:w-auto">
                            <Button
                                className={cn(
                                    "inline-flex items-center justify-center rounded px-3 py-1 text-sm font-bold text-white",
                                    "bg-blue-600 hover:bg-blue-700 border-0 h-[40px]",
                                    "dark:bg-blue-700 dark:hover:bg-blue-600"
                                )}>
                                <span className="hidden sm:inline">Ask Question</span>
                                <span className="sm:hidden">Ask Question</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                className={cn(
                                    "w-full h-10 sm:w-auto flex items-center justify-center gap-2",
                                    "bg-blue-500 hover:bg-blue-600",
                                    "dark:bg-blue-700 dark:hover:bg-blue-600"
                                )}>
                                <span className="hidden sm:inline">Ask Question</span>
                                <span className="sm:hidden">Ask Question</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-1 items-stretch w-full max-w-3xl mx-auto">
                {posts.map((post, index) => (
                    <div key={post.id}
                        className={cn(
                            "flex flex-col flex-1 items-stretch w-full max-w-screen-lg min-h-[150px]",
                            "dark:bg-gray-800 dark:border-gray-700"
                        )}>
                        <div className="flex">
                            {/* Right side - Post content */}
                            <div className="flex-1 mb-2">
                                <div className="pt-0">
                                    <div className="space-y-3 flex items-center">
                                        <Link href={`/posts/${post.slug}`} className="block group">
                                            <span
                                                className={cn(
                                                    "text-xl font-bold text-customBlue hover:text-blue-600 mr-1",
                                                    "dark:text-blue-300 dark:hover:text-blue-400"
                                                )}>
                                                {post.title}
                                            </span>
                                            <div
                                                className={cn(
                                                    "text-base font-normal text-muted-foreground line-clamp-2 mt-3",
                                                    "dark:text-gray-300"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                            />
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    {/* Author Info */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center py-1">
                                            <Avatar
                                                className={cn(
                                                    "flex items-center justify-center rounded-lg h-9 w-9",
                                                    "bg-green-100  text-2xl font-semibold uppercase",
                                                    " dark:text-green-200"
                                                )}>
                                                <AvatarImage
                                                    src={
                                                        post.user.profile_photo_path
                                                            ? `/storage/${post.user.profile_photo_path}`
                                                            : `https://ui-avatars.com/api/?name=${encodeURI(post.user.name)}&color=7F9CF5&background=EBF4FF`
                                                    }
                                                    alt={post.user.name}
                                                />
                                                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                "dark:text-gray-200"
                                            )}>{post.user.name}</p>
                                            <div className={cn(
                                                "flex items-center space-x-2 text-xs text-muted-foreground",
                                                "dark:text-gray-400"
                                            )}>
                                                <time dateTime={post.created_at}>{post.created_at}</time>
                                                <span>&middot;</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories + Upvote */}
                                    <div className="flex items-center space-x-2">
                                        {/* Categories */}
                                        <div className="flex flex-wrap gap-2">
                                            {post.categories &&
                                                post.categories.map((category) => (
                                                    <Link key={category.id}
                                                        href={`/categories/${generateSlug(category.title)}/posts`}>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "px-3 py-2 text-sm font-medium text-dark rounded border border-gray-200 border-dashed",
                                                                "hover:border-dashed hover:border-blue-600",
                                                                "dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
                                                                "dark:hover:border-blue-400"
                                                            )}
                                                        >
                                                            {category.title}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                        </div>

                                        {/* Upvote Button */}
                                        <UpvoteButton postId={post.id} initialUpvotes={post.upvote_count}
                                            initialHasUpvoted={post.isUpvote} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {index !== posts.length - 1 &&
                            <hr className={cn(
                                "w-full border-t border-dashed border-gray-300 my-4",
                                "dark:border-gray-600"
                            )} />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogCard;
