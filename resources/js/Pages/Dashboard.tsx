import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    slug: string;
    user: {
        name: string;
        profile_photo_path: string;
    };
    categories: []
    created_at: string;
    published_at: string;
}

interface Props {
    posts: BlogPost[];
    postCount: number;
}

export default function Dashboard({ posts = [], postCount }: Props) {
    return (
        <AppLayout
            title="Dashboard"
            canRegister={true}
            canLogin={true}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Pass posts to BlogCard */}
                        <BlogCard posts={posts}  postCount={postCount}/>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
