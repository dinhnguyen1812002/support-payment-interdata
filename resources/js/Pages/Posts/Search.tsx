// Trong file Posts/Search.tsx
import SearchComponent from '@/Components/Search';
import AppLayout from '@/Layouts/AppLayout';
import React from 'react';
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import {Separator} from "@/Components/ui/separator";
import BlogCard from "@/Pages/Posts/PostCard";
import {BlogPost, Category, Notification, Paginate} from "@/types";
import {usePage} from "@inertiajs/react";

interface Post {
    id: number;
    title: string;
    content: string;
}

interface SearchPageProps {
    posts: Post[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    search: string;
}
interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    postCount: number;
    keyword: string;
    selectedCategory?: string | null | undefined | unknown;
    notifications: Notification[]
}

const PostsIndex: React.FC<Props> = ({
                                         posts = [],
                                         categories = [],
                                         pagination,
                                         postCount,
                                         keyword,
                                         selectedCategory,
    notifications
                                     }) => {


    return (
        <AppLayout title="Posts" canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchComponent
                        initialSearch={keyword}
                        route="/posts"
                        pagination={pagination}
                    >
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar - Categories */}
                            <CategoriesSidebar
                                categories={categories}
                                selectedCategory={selectedCategory as string | null | undefined} // Đảm bảo kiểu hợp lệ
                                className="lg:w-1/4"
                            />
                            <Separator orientation="vertical" />

                            {/* Posts */}
                            <div className="flex-1 max-w-3xl">
                                <BlogCard posts={posts} postCount={postCount} />
                            </div>

                            <CategoriesSidebar categories={categories} className="lg:w-1/4" />
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
