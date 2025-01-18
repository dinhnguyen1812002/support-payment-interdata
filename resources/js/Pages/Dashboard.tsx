import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import BlogCard from '@/Pages/Posts/PostCard';

import {BlogPost, Notification} from '@/types';




interface Props {
    posts: BlogPost[];
    postCount: number;
    notifications: Notification[]
}

export default function Dashboard({ posts = [], postCount, notifications }: Props) {
    return (
        <AppLayout
            title="Dashboard"
            canRegister={true}
            canLogin={true}
            notifications={notifications}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                         Pass posts to BlogCard
                        <BlogCard posts={posts}
                                  postCount={postCount}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
