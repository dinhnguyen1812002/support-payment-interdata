import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Link } from "@inertiajs/react";
import useTypedPage from "@/Hooks/useTypedPage";
import {PenLine, PlusCircle, FilePenLine} from "lucide-react";
import { Button } from '@/Components/ui/button';
import { useForm } from '@inertiajs/react';
import Upvote from "@/Components/UpVote";
interface Category {
    id: number;
    title: string;
    slug: string;
}

interface BlogPost {
    id: string;
    title: string;
    content: string;
    slug: string;
    categories: Category[];
    user: {
        id:number;
        name: string;
        profile_photo_path: string;
    };
    created_at: string;
    published_at: string;
    upvotes_count: number;
    upvoted_by_user: boolean;
}

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
        <div className="container mx-auto">
            <div className="mb-6 flex items-center justify-between mt-10">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        All Questions
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

            {/* Cards Container */}
            <div className="space-y-3">
                {posts.map((post) => (
                    <Card key={post.id} className="w-full">
                        <div className="flex items-center justify-items-center">
                            {/* Left side - Upvote */}
                            <div className="p-4">
                                <Upvote
                                    postId={post.id}
                                    isUpvoted={post.upvoted_by_user}
                                 upvotes_count={post.upvotes_count}/>
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
                                                dangerouslySetInnerHTML={{__html: post.content}}
                                            />
                                        </Link>

                                        {/* Categories Section */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {post.categories && post.categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/categories/${category.slug}`}
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className=" cursor-pointer border
                                                        border-dashed hover:border-gray-600 border-gray-400 hover:border-solid"
                                                    >
                                                        {category.title}
                                                    </Badge>
                                                    {/*<Badge variant="outline"*/}
                                                    {/*       className="text-gray-700 text-sm font-medium me-2 px-3 py-1*/}
                                                    {/*           rounded dark:bg-gray-700 hover:text-blue-600 border*/}
                                                    {/*           border-dashed border-gray-400  hover:border-blue-600">*/}
                                                    {/*    {category.title}*/}
                                                    {/*</Badge>*/}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                    <Separator className="my-2"/>
                                </CardFooter>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BlogCard;

