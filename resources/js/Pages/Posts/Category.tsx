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

            <div className="max-w-6xl mx-auto">

                {/* Search Section */}
                <div className="mb-6 ">
                    <div className="flex ">
                        {/* Sidebar - Categories */}
                        <div className="hidden lg:block lg:w-56 ">
                            <div className="">
                                <CategoriesSidebar categories={categories} selectedCategory={category?.slug}
                                                   className="w-full"/>
                            </div>
                        </div>
                        <Separator orientation="vertical"/>

                        <SearchComponent initialSearch={keyword}
                                         route="/posts/search"
                                         pagination={pagination}>

                            <div className="flex-1 max-w-6xl w-full  h-full">
                                <BlogCard posts={posts} postCount={posts.length}/>
                            </div>
                        </SearchComponent>
                        {/* Posts */}

                        <div className="hidden lg:block lg:w-64 ">
                            <div className="">
                            <CategoriesSidebar categories={categories} selectedCategory={category?.slug}
                                                   className="w-full"/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </AppLayout>
    );
};


export default PostsIndex;
