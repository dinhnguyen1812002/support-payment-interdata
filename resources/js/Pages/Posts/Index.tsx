import React, {useState} from 'react';
import {router} from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import {IndexProps} from '@/types';
import {Separator} from "@/Components/ui/separator";
import SearchComponent from '@/Components/Search';
import MobileSidebar from "@/Pages/Categories/CategoriesSheet";

const PostsIndex: React.FC<IndexProps> = ({
                                         posts = [],
                                         categories = [],
                                         pagination,
                                         postCount,
                                         keyword,
                                         selectedCategory,
                                         notifications,
                                     }) => {
    const title = "Support AutoPay";

    return (
        <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>

            <div className="max-w-6xl mx-auto px-4">

                {/* Search Section */}
                <div className="mb-6 ">
                    <div className="flex flex-col lg:flex-row gap-6 ">
                        {/* Sidebar - Categories */}
                        <div className="hidden lg:block lg:w-64 ">
                            <div className="sticky top-20">
                                <CategoriesSidebar
                                    categories={categories}
                                    selectedCategory={selectedCategory as string | null | undefined} // Đảm bảo kiểu hợp lệ
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <Separator orientation="vertical"/>

                        <SearchComponent initialSearch={keyword}
                                         route="/posts/search"
                                         pagination={pagination}>

                            <div className="flex-1 max-w-6xl ">
                                <BlogCard posts={posts} postCount={postCount}/>
                            </div>
                        </SearchComponent>
                        {/* Posts */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
