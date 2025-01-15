import React, {useState} from 'react';
import {router} from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import {Category, Paginate, BlogPost} from '@/types';
import {Separator} from "@/Components/ui/separator";
import SearchComponent from '@/Components/Search';
import Pagination from "@/Components/Pagination";

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    postCount: number;
    keyword: string;
    selectedCategory?: string | null | undefined | unknown;
}

const PostsIndex: React.FC<Props> = ({
                                         posts = [],
                                         categories = [],
                                         pagination,
                                         postCount,
                                         keyword,
                                         selectedCategory
                                     }) => {
    return (
        <AppLayout title="Posts" canLogin={true} canRegister={true}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Search Section */}
                <div className="mb-6 ">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Categories */}
                        <CategoriesSidebar
                            categories={categories}
                            selectedCategory={selectedCategory as string | null | undefined} // Đảm bảo kiểu hợp lệ
                            className="lg:w-1/4"
                        />
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
