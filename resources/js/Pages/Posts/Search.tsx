import React from "react";
import { router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import BlogCard from "@/Pages/Posts/PostCard";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import { IndexProps } from "@/types";
import { Separator } from "@/Components/ui/separator";
import SearchComponent from "@/Components/Search";

const Search: React.FC<IndexProps> = ({
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
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-4">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block w-56">
                        <CategoriesSidebar
                            categories={categories}
                            selectedCategory={selectedCategory as string | null | undefined}
                            className="w-full"
                        />
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
                                <BlogCard posts={posts} postCount={postCount} />
                            </div>

                            {/* Separator between Posts and Right Sidebar */}
                            {/*<Separator orientation="vertical" className="hidden lg:flex h-auto mt-10" />*/}

                            {/* Right Sidebar */}
                            <div className="hidden lg:block w-72">
                                {/* Search Input (visually placed in sidebar) */}
                                <div className="sticky top-4">
                                    <div className="mb-6">
                                        <div id="search-container" />
                                    </div>

                                    {/* Categories */}
                                    <CategoriesSidebar
                                        categories={categories}
                                        selectedCategory={selectedCategory as string | null | undefined}
                                        className="w-full mt-6"
                                    />
                                </div>
                            </div>
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>
    );
};

export default  Search;
