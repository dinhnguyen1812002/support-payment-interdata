import React from 'react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";
import Pagination from "@/Components/Pagination";
import {Category, Paginate} from "@/types";
import Index from "@/Pages/Categories/Index";

interface BlogPost {
    id: number;
    title: string;
    content: string;
    slug: string;
    user: {
        name: string;
        profile_photo_path: string;
    };
    created_at: string;
    published_at: string;
}

interface Props {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
}

const PostsIndex: React.FC<Props> = ({ posts = [], categories = [],pagination }) => {
    return (
        <>
            <AppLayout title={'Post'} canLogin={true} canRegister={true}>
                <div className="flex mx-4  space-x-6">

                    <div className="w-1/4 space-y-4">

                        <div className="bg-white p-4 mt-12">

                            <Index categories={categories} />
                        </div>
                    </div>

                    <div className="w-1/2">

                        <div className='mb-6'>
                            <BlogCard posts={posts}/>
                        </div>
                        <Pagination
                            current_page={pagination.current_page}
                            last_page={pagination.last_page}
                            next_page_url={pagination.next_page_url}
                            prev_page_url={pagination.prev_page_url}
                        />
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default PostsIndex;
