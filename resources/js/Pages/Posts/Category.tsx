import React, { useState } from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import { Category, Paginate, BlogPost, Notification, Tag } from "@/types";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import SearchComponent from "@/Components/Search";
import { Separator } from "@/Components/ui/separator";
import LatestPosts from "@/Pages/Posts/LatestPost";
import MainLayout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";

interface Props {
    posts: BlogPost[];
    categories: Category[];
    tags: Tag[]
    pagination: Paginate;
    keyword: string;
    notifications: Notification[]
}

const PostsIndex: React.FC<Props & { category?: Category }> = ({
    posts = [],
    categories = [],
    tags= [],
    pagination,
    keyword,
    notifications = [],
    category,
}) => {


    // Lấy danh mục hiện tại từ props (nếu có)
    const categoryTitle = category ? category.title : "All Categories";

    // Cập nhật title
    const title = `Danh mục - ${categoryTitle}`;

    let postCount = posts.length;
    return (
        <MainLayout posts={posts} categories={categories} pagination={pagination} tags={tags}
        postCount={postCount} keyword={keyword} notifications={notifications} category={category}>

            {/* Posts Content */}
            <div className="flex-1 w-full max-w-5xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 dark:bg-[#0F1014] lg:border-l lg:pl-8 xl:pl-9">

                <BlogCard posts={posts} postCount={postCount} />

                {pagination && pagination.total > 0 && (
                    <div className="mt-5 sm:mt-6 md:mt-7 flex justify-center">
                        <Pagination
                            current_page={pagination.current_page}
                            next_page_url={pagination.next_page_url}
                            prev_page_url={pagination.prev_page_url}
                            last_page={pagination.last_page}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
        // <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
        //     <div className="max-w-7xl mx-auto px-4">
        //
        //         <div className="flex">
        //             {/* Main Content Area with Search Functionality */}
        //             <SearchComponent initialSearch={keyword} route="/posts/search">
        //                 <div className="flex  gap-x-4">
        //                      {/*Left Sidebar */}
        //                     <div className="hidden lg:block w-52 pr-2 ">
        //                         <CategoriesSidebar
        //                             categories={categories}
        //
        //                             selectedCategory={category?.slug}
        //                             className="w-full shrink-0"
        //                         />
        //                     </div>
        //
        //                     {/* Posts Content */}
        //                     <div className="flex-1 max-w-3xl mx-auto mt-7 px-4 border-l pl-8">
        //                         {/* Sử dụng pl-6 để đẩy nội dung ra xa border-l */}
        //                         <BlogCard posts={posts} postCount={postCount}/>
        //                         {pagination && pagination.total > 0 && (
        //                             <div className="mt-7 flex justify-center">
        //                                 <Pagination
        //                                     current_page={pagination.current_page}
        //                                     next_page_url={pagination.next_page_url}
        //                                     prev_page_url={pagination.prev_page_url}
        //                                     last_page={pagination.last_page}
        //                                 />
        //                             </div>
        //                         )}
        //                     </div>
        //                     {/* Right Sidebar */}
        //                     <div className="hidden lg:block w-64 mt-5">
        //                         <div className="top-4">
        //                             <div className="mb-6">
        //                                 <div id="search-container"/>
        //                             </div>
        //                             <div className="hidden lg:block mt-5">
        //                                 <div className="top-4">
        //                                     <LatestPosts/>
        //                                 </div>
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </SearchComponent>
        //         </div>
        //     </div>
        // </AppLayout>

    );
};


export default PostsIndex;
