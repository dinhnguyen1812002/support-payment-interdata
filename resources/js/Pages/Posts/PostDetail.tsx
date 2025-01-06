import React from 'react';
import {router, usePage} from '@inertiajs/react';
import {Clock, MessageCircle, Heart, Share2, X, Loader2} from 'lucide-react';
import AppLayout from "@/Layouts/AppLayout";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/ui/badge";
import CommentsSection from "@/Pages/Comments/CommentsSection";
import {route} from "ziggy-js";
import {Category} from "@/types";
import {Comment} from "@/types";

import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import Upvote from "@/Components/UpVote";


interface BlogPost {
    id: string;
    title: string;
    content: string;
    user: {
        name: string;
        profile_photo_path: string;
    };
    categories: Category[];
    created_at: string;
    published_at: string;
    updated_at: string;
    comments: Comment[];
    upvotes_count: number;
    upvoted_by_user: boolean;
}

interface PostDetailProps {
    post: BlogPost;
    categories: Category[];
    auth: {
        user: {
            id: number;
            name: string;
            profile_photo_path: string;
        };
    };
}

const PostDetail: React.FC<PostDetailProps> = ({ post, auth, categories }) => {

    const handleCommentSubmit = (comment: string, parentId?: number) => {
        router.post(route('comments.store'), {
            comment: comment,
            post_id: post.id,
            parent_id: parentId || null,
        }, {
            preserveScroll: true,
            preserveState: true,

            onError: (errors) => {
                console.error('Comment submission errors:', errors);
            }
        });
    };

    const userAvatar =  post.user.profile_photo_path
        ? `/storage/${post.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`;

    return (
        // <AppLayout title={post.title} canLogin={true} canRegister={true}>
        //
        //     <div className="max-w-4xl mx-auto px-4 py-8">
        //         {/*<CategoriesSidebar*/}
        //         {/*    categories={post.categories}*/}
        //         {/*    selectedCategory={post.categories[0]?.slug}*/}
        //         {/*/>*/}
        //         {/* Article Header */}
        //         <div className="mb-8">
        //             <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        //
        //             {/* Article Content */}
        //             <article className="prose prose-lg max-w-none mb-12">
        //                 <div dangerouslySetInnerHTML={{__html: post.content}}/>
        //             </article>
        //             <div className="flex items-center space-x-4 mb-6">
        //                 <img
        //                     src={
        //                         post.user.profile_photo_path
        //                             ? `/storage/${post.user.profile_photo_path}`
        //                             : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`
        //                     }
        //                     alt={post.user.name}
        //                     className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
        //                 />
        //                 <div>
        //                     <h3 className="font-medium text-gray-900">{post.user.name}</h3>
        //                     <div className="flex items-center text-sm text-gray-500">
        //                         <Clock className="w-4 h-4 mr-1"/>
        //                         <time dateTime={post.created_at}>
        //                             {new Date(post.created_at).toLocaleDateString()}
        //                         </time>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //
        //
        //         {/* Interaction Buttons */}
        //         <div className="flex items-center space-x-6 border-y border-gray-200 py-4 mb-8">
        //             <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
        //                 <Heart className="w-5 h-5"/>
        //                 <span>Like</span>
        //             </button>
        //             <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
        //                 <MessageCircle className="w-5 h-5"/>
        //                 <span>Comment</span>
        //             </button>
        //             <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
        //                 <Share2 className="w-5 h-5"/>
        //                 <span>Share</span>
        //             </button>
        //             {post.categories?.map((category) => (
        //                 <Link key={category.id} href={route('categories')}>
        //                     <Badge variant="outline"
        //                            className="text-blue-800 text-sm font-medium me-2 px-3 py-1 rounded dark:bg-gray-700 dark:text-blue-400 border border-dashed border-blue-400 hover:border-solid hover:border-blue-600">
        //                         {category.title}
        //                     </Badge>
        //                 </Link>
        //             ))}
        //         </div>
        //
        //         {/* Comments Section */}
        //         <CommentsSection
        //             initialComments={post.comments as []}
        //             onCommentSubmit={handleCommentSubmit}
        //             currentUserAvatar={userAvatar}
        //         />
        //     </div>
        // </AppLayout>

    <AppLayout title={'Post'} canLogin={true} canRegister={true}>
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content with categories sidebar */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                    {/* Categories Sidebar */}

                    <CategoriesSidebar
                        categories={categories}
                        selectedCategory={null}
                        className="lg:w-1/4"
                    />
                    <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"></div>

                    <div className="flex-1 max-w-3xl">
                        <div className="space-y-6 mt-10">
                            <div className="max-w-4xl mx-auto px-4 py-8">
                                {/*<CategoriesSidebar*/}
                                {/*    categories={post.categories}*/}
                                {/*    selectedCategory={post.categories[0]?.slug}*/}
                                {/*/>*/}
                                {/* Article Header */}
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

                                    {/* Article Content */}
                                    <article className="prose prose-lg max-w-none mb-12">
                                        <div dangerouslySetInnerHTML={{__html: post.content}}/>
                                    </article>
                                    <div className="flex items-center space-x-4 mb-6">
                                        <img
                                            src={
                                                post.user.profile_photo_path
                                                    ? `/storage/${post.user.profile_photo_path}`
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`
                                            }
                                            alt={post.user.name}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-900">{post.user.name}</h3>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="w-4 h-4 mr-1"/>
                                                <time dateTime={post.created_at}>
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </time>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Interaction Buttons */}
                                <div className="flex items-center space-x-6 border-y border-gray-200 py-4 mb-8">
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
                                        <Heart className="w-5 h-5"/>
                                        <span>Like</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                                        <MessageCircle className="w-5 h-5"/>
                                        <span>Comment</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
                                        <Share2 className="w-5 h-5"/>
                                        <span>Share</span>
                                    </button>
                                    {post.categories?.map((category) => (
                                        <Link key={category.id} href={route('categories')}>
                                            <Badge variant="outline"
                                                   className="text-blue-800 text-sm font-medium me-2 px-3 py-1 rounded dark:bg-gray-700 dark:text-blue-400 border border-dashed border-blue-400 hover:border-solid hover:border-blue-600">
                                                {category.title}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>

                                {/* Comments Section */}
                                <CommentsSection
                                    initialComments={post.comments as []}
                                    onCommentSubmit={handleCommentSubmit}
                                    currentUserAvatar={userAvatar}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
    )
        ;
};

export default PostDetail;
