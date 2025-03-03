import React from "react";
import { router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import BlogCard from "@/Pages/Posts/PostCard";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import { IndexProps } from "@/types";
import { Separator } from "@/Components/ui/separator";
import SearchComponent from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import LatestPost from "@/Pages/Posts/LatestPost";
import LatestPosts from "@/Pages/Posts/LatestPost";
import MainLayout from "@/Layouts/Layout";

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
        // <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
        //     <div className="max-w-7xl mx-auto px-0 flex flex-1 mt-2 items-center">
        //
        //         <div className="flex">
        //             {/* Main Content Area with Search Functionality */}
        //             <SearchComponent initialSearch={keyword} route="/posts/search">
        //                 <div className="flex flex-1 gap-x-10">
        //                     {/* Left Sidebar */}
        //                     <div className="hidden lg:block w-52 pr-2 ">
        //                         <CategoriesSidebar
        //                             categories={categories}
        //
        //                             selectedCategory={selectedCategory as string | null | undefined}
        //                             className="w-full flex-shrink-0"
        //                         />
        //                     </div>
        //
        //                     {/* Separator */}
        //                     <Separator orientation="vertical" className="hidden lg:flex h-auto mt-10 ml-[-2rem]"/>
        //
        //                     {/* Posts Content */}
        //                     <div className="flex-1 max-w-3xl mx-auto mt-7 px-4">
        //                         <BlogCard posts={posts} postCount={postCount}/>
        //                         {pagination && pagination.total > 0 && (
        //                             <div className="mt-7 flex justify-center">
        //                                 <Pagination
        //                                     current_page={pagination.current_page}
        //                                     last_page={pagination.last_page}
        //                                     next_page_url={pagination.next_page_url}
        //                                     prev_page_url={pagination.prev_page_url}
        //                                 />
        //                             </div>
        //                         )}
        //                     </div>
        //
        //
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
        <MainLayout posts={posts} categories={categories} pagination={pagination} postCount={postCount} keyword={keyword} notifications={notifications} >
            <div className="flex-1 max-w-5xl  mx-auto mt-7 px-4 border-l pl-12">
                {/* Sử dụng pl-6 để đẩy nội dung ra xa border-l */}
                <BlogCard posts={posts} postCount={postCount} />
                {pagination && pagination.total > 0 && (
                    <div className="mt-7 flex justify-center">
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




    );
};

export default PostsIndex;
