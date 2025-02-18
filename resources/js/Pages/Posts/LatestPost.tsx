import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {ArrowRight, ChevronRight, Clock, Menu} from 'lucide-react';
import { cn } from "@/lib/utils";
import axios from 'axios';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
}

const LatestPosts: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        axios.get('/latest-posts')
            .then((response) => setPosts(response.data))
            .catch((error) => console.error('Error fetching latest posts:', error));
    }, []);

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
                    "bg-gray-50 border-0 lg:rounded-md lg:bg-gray-50 lg:w-80",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}
            >
                <CardHeader className="pb-3  rounded-t-md">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 ">
                            Latest Updates
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-blue-500 hover:text-white -mr-2"
                            asChild
                        >
                            {/*<a href="/posts" className="flex items-center gap-1 text-sm">*/}
                            {/*    View all*/}
                            {/*    <ChevronRight className="w-4 h-4" />*/}
                            {/*</a>*/}
                        </Button>
                    </div>

                </CardHeader>
                <CardContent className="p-0 bg-white">
                    <div className="divide-y divide-gray-100">
                        {posts.map((post) => (
                            <Button
                                key={post.id}
                                variant="ghost"
                                className="w-full justify-start h-auto py-3 px-4 text-base hover:bg-gray-50 rounded-none"
                                asChild
                            >
                                <a
                                    href={`/posts/${post.slug}`}
                                    className="flex items-center gap-3 w-full group"
                                >
                                    <div className="flex-1 text-left font-medium text-gray-700 whitespace-normal overflow-hidden group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </div>
                                    {/*<ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors"/>*/}
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
