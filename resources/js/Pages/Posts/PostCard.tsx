import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Link } from "@inertiajs/react";
import useTypedPage from "@/Hooks/useTypedPage";
import { PenLine, PlusCircle } from "lucide-react";
import { Button } from '@/Components/ui/button';
import Upvote from "@/Components/UpVote";
import {BlogPost, Category} from "@/types";

import  {generateSlug} from "@/Utils/slugUtils";
import SearchComponent from "@/Components/Search";
interface BlogCardProps {
    posts: BlogPost[];
    postCount: number;

}

const BlogCard: React.FC<BlogCardProps> = ({ posts = [], postCount }) => {
    const page = useTypedPage();

    if (posts.length === 0) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">No questions available. ({postCount})</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto mb-8">
            <div className="mb-6 flex items-center justify-between mt-5">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Tất cả câu hỏi
                        <span className="text-gray-500 pl-2">({postCount})</span>
                    </h2>
                    <p className="text-base text-muted-foreground">
                        Browse through all community questions and discussions.
                    </p>
                </div>

                <Link href="/posts/create">
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Ask Question
                    </Button>
                </Link>

            </div>

            <div className="space-y-3">
                {posts.map((post) => (
                    <Card key={post.id} className="w-full border-none shadow-none">
                        <div className="flex">
                            {/* Left side - Upvote */}
                            <div className=" flex items-center justify-items-center">
                                <Upvote
                                    postId={post.id}
                                    initialIsUpvote={post.isUpvote}
                                    initialUpvoteCount={post.upvote_count}
                                    upvote_count={post.upvote_count}
                                />
                            </div>

                            {/* Right side - Post content */}
                            <div className="flex-1">
                                <CardHeader className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        post.user.profile_photo_path
                                                            ? `/storage/${post.user.profile_photo_path}`
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`
                                                    }
                                                    alt={post.user.name}
                                                />
                                                <AvatarFallback>
                                                    {post.user.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{post.user.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                    <time dateTime={post.created_at}>
                                                        {post.created_at}
                                                    </time>
                                                    <span>&middot;</span>
                                                </div>
                                            </div>
                                        </div>
                                        {page.props.auth.user?.id === post.user.id && (
                                            <Link
                                                href={`/posts/${post.slug}/edit`}
                                                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-md px-3 py-1.5 hover:bg-blue-50 border border-transparent hover:border-blue-100"
                                            >
                                                <PenLine className="w-4 h-4" />
                                                <span className="text-sm font-medium">Chỉnh sửa</span>
                                            </Link>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-0">
                                    <div className="space-y-2">
                                        <Link
                                            href={`/posts/${post.slug}`}
                                            className="block group"
                                        >
                                            <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            <div
                                                className="text-sm text-muted-foreground line-clamp-2 mt-1"
                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                            />
                                        </Link>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {post.categories && post.categories.map((category) => (
                                                <Link
                                                    key={category.id}

                                                    href={`/categories/${generateSlug(category.title)}/posts`}
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className="cursor-pointer border border-dashed hover:border-gray-600 border-gray-400 hover:border-solid"
                                                    >
                                                        {category.title}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                {/*<CardFooter className="p-4 pt-0">*/}
                                {/*    <Separator className="my-2" />*/}
                                {/*</CardFooter>*/}
                            </div>
                        </div>
                        <Separator className="my-2 border-dashed border-0 border-sky-500" />
                    </Card>
                ))}

            </div>

        </div>
    );
};

export default BlogCard;
