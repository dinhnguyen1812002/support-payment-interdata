import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Clock, ArrowRight, Menu } from 'lucide-react';
import { cn } from "@/lib/utils";
import {BlogPost} from "@/types";



interface LatestPostsProps {
    posts: BlogPost[];
}

const LatestPosts: React.FC<LatestPostsProps> = ({ posts }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                className="fixed right-4 top-4 z-50 lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Card */}
            <Card
                className={cn(
                    "fixed top-0 right-0 h-auto max-h-screen w-80 z-50 shadow-xl transition-transform duration-300 lg:static lg:shadow-none",
                    "bg-gray-50 border-0 rounded-md lg:rounded-md lg:bg-gray-50 lg:w-80",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}
            >
                <CardHeader className="pb-2 bg-gray-50 z-10">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Clock className="w-5 h-5" />
                        Latest Posts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="px-4 pb-4">
                        {posts.map((post) => (
                            <Button
                                key={post.id}
                                variant="ghost"
                                className="w-full justify-start h-auto py-2 text-base hover:bg-gray-100"
                                asChild
                            >
                                <a
                                    href={`/posts/${post.slug}`}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex-1 text-left font-medium text-gray-700">
                                        {post.title}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                </a>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default LatestPosts;
