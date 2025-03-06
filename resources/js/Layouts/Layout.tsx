import React from "react";
import { router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import BlogCard from "@/Pages/Posts/PostCard";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import {Category, IndexProps} from "@/types";
import { Separator } from "@/Components/ui/separator";
import SearchComponent from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import LatestPost from "@/Pages/Posts/LatestPost";
import LatestPosts from "@/Pages/Posts/LatestPost";


const MainLayout: React.FC<IndexProps & { category?: Category }> = ({
                                              categories = [],
                                              keyword,
                                              children,
                                              category,
                                              notifications,
                                          }) => {
    const title = "Support AutoPay";

    return (
        <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-[1354px] mx-auto lg:px-4 dark:bg-[#0F1014]">

                <div className="flex">
                    {/* Main Content Area with Search Functionality */}
                    <SearchComponent initialSearch={keyword} route="/posts/search">
                        <div className="flex  gap-x-4">
                            {/* Left Sidebar */}
                            <div className="hidden lg:block w-52 pr-2 ml-[-10px]">
                                <CategoriesSidebar
                                    categories={categories}
                                    selectedCategory={category?.slug}
                                    className="w-full flex-shrink-0"
                                />
                            </div>



                            {/* main Content */}
                            {children}


                            {/* Right Sidebar */}
                            <div className="hidden lg:block w-72 mt-5">
                                <div className="top-4">
                                    <div className="mb-6">
                                        <div id="search-container"/>
                                    </div>
                                    <div className="hidden lg:block mt-5">
                                        <div className="top-4">
                                            <LatestPosts/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>


    );
};

export default MainLayout;
