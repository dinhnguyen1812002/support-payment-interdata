import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Category, Notification, Comment } from '@/types';
import UpvoteButton from '@/Components/VoteButton';
import SearchComponent from "@/Components/Search";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import LatestPosts from "@/Pages/Posts/LatestPost";
import Sidebar from '@/Components/Sidebar';

interface BlogPost {
    next_page_url: string | null;
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
    has_upvoted: boolean;
    upvotes_count: number;
}

interface PostDetailProps {
    post: BlogPost;
    categories: Category[];
    keyword: string;
    auth: {
        user: {
            id: number;
            name: string;
            profile_photo_path: string;
        };
    };
    notifications: Notification[];
}

const PostDetail: React.FC<PostDetailProps> = ({
    post,
    auth,
    categories,
    notifications,
    keyword
}) => {
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedCategory = usePage().props.selectedCategory;

    const userAvatar = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'Guest')}&color=7F9CF5&background=EBF4FF`;

    const authorAvatar = post.user.profile_photo_path
        ? `/storage/${post.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`;

    // Submit a new comment
    const handleCommentSubmit = (content: string, parentId?: number) => {
        setIsSubmitting(true);
    
        router.post(
            route('comments.store'),
            { comment: content, post_id: post.id, parent_id: parentId || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    window.location.reload(); // Reload lại trang sau khi bình luận thành công
                },
                onError: errors => {
                    console.error('Error submitting comment:', errors);
                    setIsSubmitting(false);
                },
            },
        );
    };
    

    // Listen for real-time comments via Laravel Echo
    useEffect(() => {
        const channel = window.Echo.channel(`post.${post.id}.comments`);
        console.log('Nhận comment mới:');
        channel.listen('.NewCommentPosted', (event: any) => {
            console.log('Nhận comment mới:', event.comment);
            // Cập nhật state comments ngay lập tức khi nhận được comment mới
            setComments((prevComments) => {
                // Kiểm tra xem comment đã tồn tại chưa để tránh trùng lặp
                if (!prevComments.some(comment => comment.id === event.comment.id)) {
                    return [...prevComments, event.comment];
                }
                return prevComments;
            });
        });

        // Cleanup khi component unmount
        return () => {
            channel.stopListening('.NewCommentPosted');
            window.Echo.leaveChannel(`post.${post.id}.comments`);
        };
    }, [post.id]);

    const title = post.title;

    return (
        <AppLayout title={title} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-[1354px] mx-auto px-4">
                <div className="flex">
                    <SearchComponent initialSearch={keyword} route="/posts/search">
                        <div className="flex gap-x-4">
                            <div className="hidden lg:block w-52 pr-2 ml-[-10px]">
                                <Sidebar categories={[]} />
                            </div>
                            <div className="flex-1 w-full max-w-5xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4 dark:bg-[#0F1014] lg:border-l lg:pl-8 xl:pl-12">
                                <div className="mt-5 space-y-4">
                                    <div className="mb-1">
                                        <span className="text-2xl font-bold text-customBlue mb-0 me-1 dark:text-[#F5F5F5]">
                                            {post.title}
                                        </span>
                                        <div className="mb-6 max-w-none prose prose-lg">
                                            <p className="text-lg font-normal text-gray-800 mb-10 mr-1 dark:text-mutedText"
                                               dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center mb-4 justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-9 w-9 rounded-md">
                                                <AvatarImage
                                                    src={authorAvatar}
                                                    alt={post.user.name}
                                                />
                                                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="text-gray-800 text-sm font-semibold leading-tight mb-0.5 dark:text-mutedText">{post.user.name}</h3>
                                                <p className="text-xs text-mutedText font-semibold leading-tight">{post.created_at}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {post.categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/categories/${category.slug}/posts`}
                                                    className="cursor-pointer"
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className="px-3 py-1 text-sm font-medium text-blue-800 rounded border border-blue-400 border-dashed dark:bg-gray-700 dark:text-blue-400 hover:border-solid hover:border-blue-600"
                                                    >
                                                        {category.title}
                                                    </Badge>
                                                </Link>
                                            ))}
                                            <UpvoteButton
                                                postId={post.id}
                                                initialUpvotes={post.upvotes_count}
                                                initialHasUpvoted={post.has_upvoted}
                                            />
                                        </div>
                                    </div>
                                    <hr className="w-full border-t border-dashed border-gray-300 mt-4 mb-10" />
                                    <CommentsSection
                                        initialComments={{
                                            data: comments,
                                            next_page_url: post.next_page_url,
                                        }}
                                        onCommentSubmit={handleCommentSubmit}
                                        currentUserAvatar={userAvatar}
                                    />
                                </div>
                            </div>
                            <div className="hidden lg:block w-72 mt-5">
                                <div className="top-4">
                                    <div className="mb-6">
                                        <div id="search-container" />
                                    </div>
                                    <div className="hidden lg:block mt-5">
                                        <div className="top-4">
                                            <LatestPosts />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SearchComponent>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostDetail;