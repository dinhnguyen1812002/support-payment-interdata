import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Link } from "@inertiajs/react";
import useTypedPage from "@/Hooks/useTypedPage";
import { Clock, PenLine, PlusCircle, TrendingUp } from "lucide-react";
import { Button } from '@/Components/ui/button';
import Upvote from "@/Components/UpVote";
import { BlogPost } from "@/types";
import { generateSlug } from "@/Utils/slugUtils";
import CompactFilter from "@/Components/CompactFilter";
import VoteButton from "@/Components/VoteButton";
import UpvoteButton from "@/Components/VoteButton";
import {route} from "ziggy-js";


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
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        Tất cả câu hỏi
                        <span className="text-gray-500 pl-2">({postCount})</span>
                    </h2>
                    {/*<p className="text-sm md:text-base text-muted-foreground">*/}
                    {/*    Browse through all community questions and discussions.*/}
                    {/*</p>*/}
                </div>

                {/*<p className="text-muted-foreground">No questions available. ({postCount})</p>*/}
            </div>
        )
    }
    const sortOptions = [
        {
            value: "latest",
            label: "Mới nhất",
            icon: <Clock className="w-4 h-4"/>
        },
        {
            value: "popular",
            label: "Nhiều vote nhất",
            icon: <TrendingUp className="w-4 h-4"/>
        }
    ];

    return (
        <div className=" w-full min-h-screen flex flex-col flex-1">
            <div className="flex justify-between items-center flex-wrap mb-8 lg:mb-7">

                {/* Header Section */}
                <div className="space-y-1">
                    <span className="font-bold text-2xl  text-customBlue">
                        All Questions
                        <small className="text-mutedText text-base font-semibold ml-1">({postCount})</small>
                    </span>
                    {/*<p className="text-sm md:text-base text-muted-foreground">*/}
                    {/*    Browse through all community questions and discussions.*/}
                    {/*</p>*/}


                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/*<CompactFilter*/}
                    {/*    value={sort}*/}
                    {/*    onValueChange={setSort}*/}
                    {/*    options={sortOptions}*/}
                    {/*    className="w-full sm:w-auto"*/}
                    {/*/>*/}

                    {isAuthenticated ? (
                        <Link href={route('posts.create')} className="w-full sm:w-auto">
                            <Button
                                className="inline-flex items-center justify-center rounded px-3 py-1 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-0 h-[40px]">
                                {/*<PlusCircle className="w-4 h-4"/>*/}
                                <span className="hidden sm:inline  ">Ask Question</span>
                                <span className="sm:hidden">Ask Question</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                className="w-full h-10 sm:w-auto flex items-center justify-center gap-2  bg-blue-500 hover:bg-blue-600 ">
                                {/*<PlusCircle className="w-4 h-4"/>*/}
                                <span className="hidden sm:inline">Ask Question</span>
                                <span className="sm:hidden">Ask Question</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-1 items-stretch max-w-screen-2xl">
                {posts.map((post, index) => (
                    <div key={post.id} className="flex  flex-col flex-1 items-stretch max-w-screen-2xl">
                        <div className="flex">
                            {/* Right side - Post content */}
                            <div className="flex-1 mb-2">
                                <div className="pt-0">
                                    <div className="space-y-3 flex items-center ">
                                        <Link href={`/posts/${post.slug}`} className="block group">
                                            <span className="text-xl font-bold text-customBlue hover:text-blue-600 mr-1">
                                             {post.title}
                                            </span>
                                            {/*<div*/}
                                            {/*    className="text-base font-normal text-muted-foreground line-clamp-2 mt-3 "*/}
                                            {/*    dangerouslySetInnerHTML={{__html: post.content}}*/}
                                            {/*/>*/}
                                            <div className="text-sm fw-normal text-gray-700 mt-3 "  dangerouslySetInnerHTML={{__html: post.content}}>

                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    {/* Author Info */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center py-1">
                                            <Avatar
                                                className="flex items-center justify-center rounded-lg w-10 h-10 bg-green-100 text-green-600 text-2xl font-semibold uppercase">
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
                                            <p className="text-sm font-medium">{post.user.name}</p>
                                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
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
                                                            className="px-3 py-2 text-sm font-medium text-dark rounded border border-gray-200 border-dashed dark:bg-gray-200 hover:border-dashed hover:border-blue-600"
                                                        >
                                                            {category.title}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                        </div>

                                        {/* Upvote Button */}
                                        <UpvoteButton postId={post.id} initialUpvotes={post.upvote_count}
                                                      initialHasUpvoted={post.isUpvote}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {index !== posts.length - 1 && <hr className="w-full border-t border-dashed border-gray-300 my-4 "/>}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default BlogCard;
