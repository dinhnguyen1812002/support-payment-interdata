import React from 'react';
import { AlertCircle, ChevronRight, Clock, PenLine } from 'lucide-react';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import {BlogPost, Category, Comment} from '@/types';
import Upvote from '@/Components/UpVote';
import { generateSlug } from '@/Utils/slugUtils';
import useTypedPage from "@/Hooks/useTypedPage";
import UpvoteButton from "@/Components/VoteButton";

interface ForumPostCardProps {
    post: BlogPost;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post }) => {
    return (
        <div className="py-4">
            <div className="flex gap-4">
                {/*/!* Left side - Upvote *!/*/}
                {/*<div className="flex items-start pt-2">*/}
                {/*    <Upvote*/}
                {/*        postId={post.id}*/}
                {/*        initialIsUpvote={post.isUpvote}*/}
                {/*        initialUpvoteCount={post.upvote_count}*/}
                {/*    />*/}
                {/*</div>*/}

                {/* Right side - Content */}
                <div className="flex-1">
                    {/* Title and metadata */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/posts/${post.slug}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                            >
                                {post.title}
                            </Link>
                            <AlertCircle className="w-5 h-5 text-blue-500" />
                        </div>

                        {/* Content preview */}
                        <div
                            className="text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* User info and metadata */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <AvatarWithFallback
                                    src={post.user.profile_photo_path ? `/storage/${post.user.profile_photo_path}` : null}
                                    name={post.user.name}
                                    alt={post.user.name}
                                    className="h-8 w-8"
                                    variant="geometric"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{post.user.name}</span>
                                    <span className="text-sm text-gray-500">
                    <time dateTime={post.created_at}>
                      {post.created_at}
                    </time>
                  </span>
                                </div>
                            </div>

                            {/* Categories and stats */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {post.categories?.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/categories/${generateSlug(category.title)}/posts`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            >
                                                {category.title}
                                            </Badge>
                                        </Link>
                                    ))}
                                    <span className="flex items-center gap-1">
                                        <span className="text-gray-700">{ 0}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </span>

                                    <UpvoteButton
                                        postId={post.id}
                                        initialUpvotes={post.upvote_count}
                                        initialHasUpvoted={post.isUpvote}
                                    />
                                </div>

                                {/* Edit button if user owns the post */}
                                {/*{post.user.id === useTypedPage().props.auth.user?.id && (*/}
                                {/*    <Link*/}
                                {/*        href={`/posts/${post.slug}/edit`}*/}
                                {/*        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-md px-3 py-1.5 hover:bg-blue-50 border border-transparent hover:border-blue-100"*/}
                                {/*    >*/}
                                {/*        <PenLine className="w-4 h-4"/>*/}
                                {/*    </Link>*/}
                                {/*)}*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumPostCard;
