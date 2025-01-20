import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Clock, MessageCircle, Heart, Share2 } from "lucide-react";
import CommentsSection from "@/Pages/Comments/CommentsSection";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import { Badge } from "@/Components/ui/badge";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import {Category, Notification, Comment} from "@/types";

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
    comments: Comment[];
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
    notifications: Notification[];
}

const PostDetail: React.FC<PostDetailProps> = ({ post, auth, categories, notifications }) => {
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedCategory = usePage().props.selectedCategory;

    const userAvatar = auth.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&color=7F9CF5&background=EBF4FF`;

    // Submit a new comment
    const handleCommentSubmit = (content: string, parentId?: number) => {
        setIsSubmitting(true);

        router.post(
            route("comments.store"),
            { comment: content, post_id: post.id, parent_id: parentId || null },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error("Error submitting comment:", errors);
                    setIsSubmitting(false);
                },
            }
        );
    };

    // Listen for real-time comments via Laravel Echo
    useEffect(() => {
        if (typeof window.Echo !== "undefined") {
            const channel = window.Echo.channel(`post.${post.id}.comments`);

            channel.listen(".NewCommentPosted", (event: { comment: Comment }) => {
                setComments((prev) => [...prev, event.comment]); // Add new comment to state
            });

            return () => {
                channel.stopListening(".NewCommentPosted");
                window.Echo.leaveChannel(`post.${post.id}.comments`);
            };
        }
    }, [post.id]);

    return (
        <AppLayout title="Post Details" canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <CategoriesSidebar
                        categories={categories}
                        selectedCategory={selectedCategory as string | null | undefined}
                        className="lg:w-1/4"
                    />
                    <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"></div>

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        <div className="space-y-6 mt-10">
                            {/* Post Details */}
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
                                <div className="prose prose-lg max-w-none mb-12">
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                </div>

                                {/* Author Info */}
                                <div className="flex items-center space-x-4 mb-6">
                                    <img
                                        src={userAvatar}
                                        alt={post.user.name}
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{post.user.name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="w-4 h-4 mr-1" />
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
                                    <Heart className="w-5 h-5" />
                                    <span>Like</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>Comment</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
                                    <Share2 className="w-5 h-5" />
                                    <span>Share</span>
                                </button>

                                {post.categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={route("categories")}
                                        className="cursor-pointer"
                                    >
                                        <Badge
                                            variant="outline"
                                            className="text-blue-800 text-sm font-medium px-3 py-1 rounded dark:bg-gray-700 dark:text-blue-400 border border-dashed border-blue-400 hover:border-solid hover:border-blue-600"
                                        >
                                            {category.title}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>

                            {/* Comments Section */}
                            <CommentsSection
                                initialComments={comments}
                                onCommentSubmit={handleCommentSubmit}
                                currentUserAvatar={userAvatar}
                                // isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostDetail;
