import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
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
                <p className="text-muted-foreground">No questions available. ({postCount})</p>
            </div>
        );
    }

    const sortOptions = [
        {
            value: "latest",
            label: "Mới nhất",
            icon: <Clock className="w-4 h-4" />
        },
        {
            value: "popular",
            label: "Nhiều vote nhất",
            icon: <TrendingUp className="w-4 h-4" />
        }
    ];

    return (
        <div className="container mx-auto px-4 md:px-6 mb-8 w-full max-w-screen-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 mb-6">
                {/* Header Section */}
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        Tất cả câu hỏi
                        <span className="text-gray-500 pl-2">({postCount})</span>
                    </h2>
                    {/*<p className="text-sm md:text-base text-muted-foreground">*/}
                    {/*    Browse through all community questions and discussions.*/}
                    {/*</p>*/}
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <CompactFilter
                        value={sort}
                        onValueChange={setSort}
                        options={sortOptions}
                        className="w-full sm:w-auto"
                    />

                    {isAuthenticated ? (
                        <Link href={"posts/create"} className="w-full sm:w-auto">
                            <Button className="w-full h-10 sm:w-auto flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4"/>
                                <span className="hidden sm:inline">đặt câu hỏi tại đây</span>
                                <span className="sm:hidden">Đặt câu hỏi</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4"/>
                                <span className="hidden sm:inline">Đặt câu hỏi tại đây</span>
                                <span className="sm:hidden">Đặt câu hỏi</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-3 ">

                {posts.map((post) => (

                    <div key={post.id}
                         className="w-full h-full border-none shadow-none max-w-4xl mx-auto min-h-[150px] flex flex-col">

                        <Link
                            href={`/posts/${post.slug}`}
                            className="block group"
                        />
                        <div className="flex">
                            {/* Left side - Upvote */}
                            {/*<div className="flex items-center justify-items-center">*/}
                            {/*    <Upvote*/}
                            {/*        postId={post.id}*/}
                            {/*        initialIsUpvote={post.isUpvote}*/}
                            {/*        initialUpvoteCount={post.upvote_count}*/}
                            {/*        // upvote_count={post.upvote_count}*/}
                            {/*    />*/}
                            {/*</div>*/}

                            {/* Right side - Post content */}
                            <div className="flex-1">
                                {/*<CardHeader className="p-4">*/}
                                {/*    <div className="flex items-center justify-between">*/}
                                {/*        <div className="flex items-center space-x-4">*/}
                                {/*            <Avatar className="h-8 w-8">*/}
                                {/*                <AvatarImage*/}
                                {/*                    src={*/}
                                {/*                        post.user.profile_photo_path*/}
                                {/*                            ? `/storage/${post.user.profile_photo_path}`*/}
                                {/*                            : `https://ui-avatars.com/api/?name=${encodeURI(post.user.name)}&color=7F9CF5&background=EBF4FF`*/}
                                {/*                    }*/}
                                {/*                    alt={post.user.name}*/}
                                {/*                />*/}
                                {/*                <AvatarFallback>*/}
                                {/*                    {post.user.name.charAt(0)}*/}
                                {/*                </AvatarFallback>*/}
                                {/*            </Avatar>*/}
                                {/*            <div>*/}
                                {/*                <p className="text-sm font-medium">{post.user.name}</p>*/}
                                {/*                <div*/}
                                {/*                    className="flex items-center space-x-2 text-xs text-muted-foreground">*/}
                                {/*                    <time dateTime={post.created_at}>*/}
                                {/*                        {post.created_at}*/}
                                {/*                    </time>*/}
                                {/*                    <span>&middot;</span>*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*        {page.props.auth.user?.id === post.user.id && (*/}
                                {/*            <Link*/}
                                {/*                href={`/posts/${post.slug}/edit`}*/}
                                {/*                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded-md px-3 py-1.5 hover:bg-blue-50 border border-transparent hover:border-blue-100"*/}
                                {/*            >*/}
                                {/*                <PenLine className="w-4 h-4"/>*/}
                                {/*                /!*<span className="text-sm font-medium">Chỉnh sửa</span>*!/*/}
                                {/*            </Link>*/}
                                {/*        )}*/}
                                {/*    </div>*/}
                                {/*</CardHeader>*/}

                                <div className="p-4 pt-0">
                                    <div className="space-y-2">
                                        <Link
                                            href={`/posts/${post.slug}`}
                                            className="block group"
                                        >
                                            <a className="text-xl sm:text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors leading-snug">
                                                {post.title}
                                            </a>

                                            <div
                                                className="text-sm text-muted-foreground line-clamp-2 mt-1"
                                                dangerouslySetInnerHTML={{__html: post.content}}
                                            />
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4">
                                    {/* Thông tin tác giả */}
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-8 w-8 rounded-md">
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
                                        <div>
                                            <p className="text-sm font-medium">{post.user.name}</p>
                                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                <time dateTime={post.created_at}>{post.created_at}</time>
                                                <span>&middot;</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge Categories + Upvote Button */}
                                    <div className="ml-auto flex items-center space-x-2">
                                        {/* Categories */}
                                        <div className="flex flex-wrap gap-2">
                                            {post.categories &&
                                                post.categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/categories/${generateSlug(category.title)}/posts`}
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className="px-3 py-1 text-sm font-medium text-dark rounded
                                                             border border-gray-400 border-dashed dark:bg-gray-700
                                                             hover:border-dashed hover:border-blue-600"
                                                        >
                                                            {category.title}
                                                        </Badge>
                                                    </Link>
                                                ))}
                                        </div>

                                        {/* Upvote Button */}
                                        <UpvoteButton
                                            postId={post.id}
                                            initialUpvotes={post.upvote_count}
                                            initialHasUpvoted={post.isUpvote}
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>
                        {/*<Separator className="my-2 border-dashed border-sky-500"/>*/}
                        <hr className="border-dotted border-t-2 border-gray-200 "/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogCard;
