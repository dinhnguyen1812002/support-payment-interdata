import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';
import Pagination from '@/Components/Pagination';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import { Category, Paginate, BlogPost } from '@/types';
import {Separator} from "@/Components/ui/separator";

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    postCount: number;
    keyword: string;
}

const PostsIndex: React.FC<Props> = ({ posts = [], categories = [], pagination, postCount, keyword }) => {
    const [searchKeyword, setSearchKeyword] = useState<string>(keyword || '');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Gửi từ khóa tìm kiếm lên server
        router.get('/posts', { keyword: searchKeyword }, { preserveState: true });
    };

    return (
        <AppLayout title="Posts" canLogin={true} canRegister={true}>
            <div className="max-w-6xl mx-auto px-4">

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - Categories */}
                    <CategoriesSidebar categories={categories} className="lg:w-1/4" />
                    <Separator orientation="vertical" />
                    {/* Posts */}
                    <div className="flex-1 max-w-3xl">
                        <BlogCard posts={posts} postCount={postCount} />

                        <Pagination
                            current_page={pagination.current_page}
                            last_page={pagination.last_page}
                            next_page_url={pagination.next_page_url}
                            prev_page_url={pagination.prev_page_url}
                        />
                    </div>
                    <CategoriesSidebar categories={categories} className="lg:w-1/4" />
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
