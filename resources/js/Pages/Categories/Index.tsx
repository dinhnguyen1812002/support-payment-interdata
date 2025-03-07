import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import CategoriesSheet from '@/Pages/Categories/CategoriesSheet';
import { IndexProps } from '@/types';
import { Separator } from "@/Components/ui/separator";
import SearchComponent from '@/Components/Search';

const PostsIndex: React.FC<IndexProps> = ({
                                              posts = [],
                                              categories = [],
                                              pagination,
                                              postCount,
                                              keyword,
                                              selectedCategory,
                                              notifications
                                          }) => {
    const title = "Support Autopay";

    return (
        <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Search Section */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Categories */}
                        {/* Hiển thị trên màn hình lớn */}
                        <div className="hidden lg:block lg:w-64">
                            <div className="sticky top-20">
                                <CategoriesSidebar
                                  
                                    selectedCategory={selectedCategory as string | null | undefined} // Đảm bảo kiểu hợp lệ
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Hiển thị trên màn hình nhỏ */}
                        <div className="md:hidden mb-4">
                            {/*<CategoriesSheet*/}
                            {/*    categories={categories}*/}
                            {/*    selectedCategory={selectedCategory as string | null | undefined}*/}
                            {/*/>*/}
                        </div>

                        <Separator orientation="vertical" />

                        {/* Search Component & Posts */}
                        <SearchComponent initialSearch={keyword}
                                         route="/posts/search"
                                         pagination={pagination}>
                            <div className="flex-1 max-w-6xl">
                                <BlogCard posts={posts} postCount={postCount} />
                            </div>
                        </SearchComponent>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
