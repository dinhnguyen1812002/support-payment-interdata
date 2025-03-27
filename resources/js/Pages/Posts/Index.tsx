import React from "react";
import BlogCard from "@/Pages/Posts/PostCard";
import { IndexProps } from "@/types";
import Pagination from "@/Components/Pagination";
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

        <MainLayout
            posts={posts}
            categories={categories}
            pagination={pagination}
            postCount={postCount}
            keyword={keyword}
            notifications={notifications}
        >
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
    );
};

export default PostsIndex;
