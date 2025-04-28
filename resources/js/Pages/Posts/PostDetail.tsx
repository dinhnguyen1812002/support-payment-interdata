import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {Category, Notification, Tag} from '@/types';
import UpvoteButton from '@/Components/VoteButton';
import SearchComponent from "@/Components/Search";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import LatestPosts from "@/Pages/Posts/LatestPost";
import Sidebar from '@/Components/Sidebar';
import SearchInput from "@/Components/search-input";
import {Comment} from "@/types/CommentTypes";
import PostContent from "@/Components/post-content";

interface BlogPost {
    next_page_url: string | null;
    id: string;
    title: string;
    content: string;
    user: { name: string; profile_photo_path: string };
    categories: Category[];
    created_at: string;
    comments: Comment[];
    has_upvoted: boolean;
    upvotes_count: number;
    tags: Tag[];
}

interface PostDetailProps {
    post: BlogPost;
    categories: Category[];
    keyword: string;
    auth: { user: { id: number; name: string; profile_photo_path: string } };
    notifications: Notification[];
}

// Define the expected shape of the Echo event
interface NewCommentEvent {
    comment: Comment;
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
    const { props } = usePage();
    const selectedCategory = props.selectedCategory;
    const currentUser = auth?.user || null;
    const [body, setBody] = useState('');
    const userAvatar = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'Guest')}&color=7F9CF5&background=EBF4FF`;

    const authorAvatar = post.user.profile_photo_path
        ? `/storage/${post.user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`;
    const handleSearch = (value: string) => {
        if (value.trim()) {
            router.get("/posts/search", { search: value, page: 1 });
        }
    };
    // Submit a new comment
    const handleCommentSubmit = (content: string, parentId?: number) => {
        router.post(
            route('comments.store'),
            {
                comment: content,
                post_id: post.id,
                parent_id: parentId || null
            },
            {
                onSuccess: () => setBody(''),
                preserveScroll: true,
                onError: errors => {
                    console.error('Error submitting comment:', errors);
                },
            },
        );
    };

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
                            <PostContent
                                post={post}
                                comments={comments}
                                currentUser={currentUser}
                                onCommentSubmit={handleCommentSubmit}
                            />
                            <div className="hidden lg:block mt-5 w-72">
                                <div className="top-4">
                                    <div className="mb-6">
                                        <SearchInput
                                            placeholder="Tìm kiếm..."
                                            onSearch={handleSearch}
                                        />
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
