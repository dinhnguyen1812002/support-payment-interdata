import React, { useState } from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import {Category, Paginate, BlogPost, Notification} from "@/types";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import SearchComponent from "@/Components/Search";
import { Separator } from "@/Components/ui/separator";

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    keyword: string;
    notifications: Notification[]
}

const PostsIndex: React.FC<Props & { category?: Category }> = ({
    posts = [],
    categories = [],
    pagination,
    keyword,
    notifications = [],
    category
}) => {
    // Lấy danh mục hiện tại từ props (nếu có)
    const categoryTitle = category ? category.title : "All Categories";

    // Cập nhật title
    const title = `Danh mục - ${categoryTitle}`;

    return (
        <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-4">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block w-56">
                        <CategoriesSidebar categories={categories} selectedCategory={category?.slug}
                                           className="w-full"/>
                    </div>

                    {/* Separator between Sidebar and Posts */}
                    <Separator orientation="vertical" className="hidden lg:flex h-auto mt-10" />

                    {/* Main Content Area with Search Functionality */}
                    <SearchComponent
                        initialSearch={keyword}
                        route="/posts/search"
                        pagination={pagination}
                    >
                        <div className="flex flex-1">
                            {/* Posts Content */}
                            <div className="flex-1">
                                <BlogCard posts={posts} postCount={posts.length} />
                                {pagination && pagination.total > 0 && (
                                    <div className="mt-7 flex justify-center items-center " >
                                        <Pagination
                                            current_page={pagination.current_page}
                                            last_page={pagination.last_page}
                                            next_page_url={pagination.next_page_url}
                                            prev_page_url={pagination.prev_page_url}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Separator between Posts and Right Sidebar */}
                            {/*<Separator orientation="vertical" className="hidden lg:flex h-auto mt-10" />*/}

                            {/* Right Sidebar */}
                            <div className="hidden lg:block w-72 mt-5">
                                {/* Search Input (visually placed in sidebar) */}
                                <div className="sticky top-4">
                                    <div className="mb-6">
                                        <div id="search-container" />
                                    </div>

                                    {/* Categories */}
                                    {/*<CategoriesSidebar*/}
                                    {/*    categories={categories}*/}
                                    {/*    selectedCategory={selectedCategory as string | null | undefined}*/}
                                    {/*    className="w-full mt-6"*/}
                                    {/*/>*/}
                                </div>
                            </div>
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>
    );
};


export default PostsIndex;
