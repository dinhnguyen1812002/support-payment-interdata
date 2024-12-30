import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Link } from "@inertiajs/react";
import useTypedPage from "@/Hooks/useTypedPage";
import { PlusCircle } from "lucide-react";
import { Button } from '@/Components/ui/button';

interface Category {
    id: number;
    title: string;
    slug: string;
}

interface BlogPost {
    id: number;
    title: string;
    content: string;
    slug: string;
    categories: Category[];
    user: {
        name: string;
        profile_photo_path: string;
    };
    created_at: string;
    published_at: string;
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
            {/* Header Section */}
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
                                <Link href={`/posts/${post.slug}/edit`}>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                </Link>
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
                                                variant="secondary"
                                                className="hover:bg-secondary/80 cursor-pointer"
                                            >
                                                {category.title}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                            <Separator className="my-2" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BlogCard;
