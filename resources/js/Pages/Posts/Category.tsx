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
                <div className="mb-6">
                    <SearchComponent
                        initialSearch={keyword}
                        route={selectedCategory ? `/categories/${selectedCategory}/posts` : `/posts`}
                        pagination={pagination}
                    >
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar - Categories */}
                            <CategoriesSidebar
                                categories={categories}
                                className="lg:w-1/4"
                            />
                            <Separator orientation="vertical" />

                            {/* Posts */}
                            <div className="flex-1 max-w-3xl">
                                <BlogCard posts={posts} postCount={postCount} />

                            </div>
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
