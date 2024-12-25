import React from 'react';

import {Head} from '@inertiajs/react';
import BlogCard from "@/Pages/Posts/PostCard";
import AppLayout from "@/Layouts/AppLayout";

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
}

const PostsIndex: React.FC<Props> = ({posts = []}) => {
    return (
        <>
            <AppLayout title={'Post'} canLogin={true} canRegister={true}>
                < div className="mx-auto w-1/2">
                    <BlogCard posts={posts}/>
                </div>
            </AppLayout>

        </>
    );
};

export default PostsIndex;
