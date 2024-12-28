import React, { useState } from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import Index from "@/Pages/Categories/Index";
import { Category, Paginate } from "@/types";
import { Button } from "@headlessui/react";
import { Separator } from "@/Components/ui/separator"
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

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
}

const PostsIndex: React.FC<Props> = ({ posts = [], categories = [], pagination }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (slug: string) => {
        setSelectedCategory(slug);
        // Fetch data logic here (e.g., call API to get posts for the selected category)
        console.log(`Fetching posts for category: ${slug}`);
    };

    return (
        <AppLayout title={'Post'} canLogin={true} canRegister={true}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main content with categories sidebar */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-6">
                        {/* Categories Sidebar */}
                        <div className="lg:max-w-52 mt-10">
                            <h2 className="text-lg font-semibold mb-2">Categories</h2>
                            <div className="space-y-1">
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.slug)} // Attach click handler
                                        className="w-full justify-between text-left
                                        px-2 font-normal hover:bg-slate-100 flex items-center"

                                    >
                                        {category.title}
                                        <span className="ml-11">1</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {/*<Separator orientation="vertical" className="mt-10 h-5/6 border-l border-dashed border-gray-300" />*/}
                        {/* Blog Posts */}
                        <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"> </div>
                        <div className="flex-1 max-w-3xl">

                            <div className="space-y-6">
                                <BlogCard posts={posts}/>
                                <Pagination
                                    current_page={pagination.current_page}
                                    last_page={pagination.last_page}
                                    next_page_url={pagination.next_page_url}
                                    prev_page_url={pagination.prev_page_url}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
