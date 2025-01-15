import React, { useState } from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import { Category, Paginate, BlogPost } from "@/types";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import SearchComponent from "@/Components/Search";
import { Separator } from "@/Components/ui/separator";

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    keyword: string;
}

const PostsIndex: React.FC<Props> = ({ posts = [], categories = [], pagination, keyword }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (slug: string) => {
        setSelectedCategory(slug);
        console.log(`Fetching posts for category: ${slug}`);
    };

    // Count the number of posts on the current page
    const postCount = posts.length;

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
                            <div className="flex-1 max-w-full ">
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
