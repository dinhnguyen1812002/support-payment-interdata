import React, { useState } from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import { Category, Paginate,BlogPost } from "@/types";
import { Button } from "@headlessui/react";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";

// interface BlogPost {
//     id: string;
//     title: string;
//     content: string;
//     slug: string;
//     categories: Category[];
//     user: {
//         id: number;
//         name: string;
//         profile_photo_path: string;
//     };
//
//     created_at: string;
//     published_at: string;
//     upvote_count: number;
//     isUpvote: boolean;
// }

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    postCount: number;
}

const PostsIndex: React.FC<Props> = ({ posts = [], categories = [], pagination , postCount}) => {
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
                        <CategoriesSidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            className="lg:w-1/4"
                        />


                        <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"> </div>
                        <div className="flex-1 max-w-3xl">
                            <div className="space-y-6">
                                <BlogCard posts={posts}
                                          postCount={postCount}
                                />
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
