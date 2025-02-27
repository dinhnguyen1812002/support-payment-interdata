import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Clock, MessageCircle, Heart, Share2 } from 'lucide-react';
import CommentsSection from '@/Pages/Comments/CommentsSection';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Category, Notification, Comment } from '@/types';
import UpvoteButton from '@/Components/VoteButton';
import {Separator} from "@/Components/ui/separator";
import SearchComponent from "@/Components/Search";
import BlogCard from "@/Pages/Posts/PostCard";
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/ui/avatar";
import LatestPosts from "@/Pages/Posts/LatestPost";
import MainLayout from "@/Layouts/Layout";

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

  // Avatar của người viết bài
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
        preserveState: true,
        onSuccess: page => {
          setIsSubmitting(false);
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
    if (typeof window.Echo !== 'undefined') {
      const channel = window.Echo.channel(`post.${post.id}.comments`);

      channel.listen('.NewCommentPosted', (event: { comment: Comment }) => {
        console.log('New comment received:', event.comment); // Log để kiểm tra
        setComments(prev => [...prev, event.comment]);
      });

      return () => {
        channel.stopListening('.NewCommentPosted');
        window.Echo.leaveChannel(`post.${post.id}.comments`);
      };
    }
  }, [post.id]);

  return (
      <AppLayout title={post.title} canLogin={true} canRegister={true} notifications={notifications}  >
          <div className="max-w-7xl mx-auto px-0 flex flex-1 mt-2 items-center">

              <div className="flex">
                  {/* Main Content Area with Search Functionality */}
                  <SearchComponent initialSearch={keyword} route="/posts/search">
                      <div className="flex flex-1 gap-x-10">
                          {/* Left Sidebar */}
                          <div className="hidden lg:block w-52 pr-2 ">
                              <CategoriesSidebar
                                  categories={categories}
                                  selectedCategory={selectedCategory as string | null | undefined}
                                  className="w-full flex-shrink-0"
                              />
                          </div>

                          {/* Separator */}
                          <Separator orientation="vertical" className="hidden lg:flex h-auto mt-10 ml-[-2rem]"/>

                          {/*main Content*/}
                          <div className="flex-1 max-w-3xl">
                              <div className="mt-5 space-y-4">
                                  {/* Post Details */}
                                  <div className="mb-1">
                                      <span className="text-3xl font-bold text-gray-900 mb-0 me-1">
                                          {post.title}
                                      </span>
                                      <div className="mb-6 max-w-none prose prose-lg">
                                          <p className="text-lg font-normal text-gray-900 mb-0 mr-1"
                                             dangerouslySetInnerHTML={{__html: post.content}}></p>
                                      </div>
                                  </div>
                                  {/* Interaction Buttons */}
                                  <div className="flex items-center mb-4 justify-between">
                                      <div className="flex items-center space-x-2">
                                          {/* Avatar */}
                                          <Avatar className="h-9 w-9 rounded-md">
                                              <AvatarImage
                                                  src={
                                                      post.user.profile_photo_path
                                                          ? `/storage/${post.user.profile_photo_path}`
                                                          : `https://ui-avatars.com/api/?name=${encodeURI(post.user.name)}&color=7F9CF5&background=EBF4FF`
                                                  }
                                                  alt={post.user.name}
                                              />
                                              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                          </Avatar>

                                          {/* User Info */}
                                          <div className="flex flex-col h-full justify-center">
                                              <h3 className="text-gray-800 text-sm font-semibold leading-tight mb-0.5">{post.user.name}</h3>
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
                                                      className="px-3 py-1 text-sm font-medium text-blue-800 rounded border border-blue-400 border-dashed
                                                         dark:bg-gray-700 dark:text-blue-400 hover:border-solid hover:border-blue-600"
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
                                  <hr className="w-full border-t border-dashed border-gray-300 my-4 "/>
                                  {/* Comments Section */}
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

                          {/* Right Sidebar */}
                          <div className="hidden lg:block w-64 mt-5">
                              <div className="top-4">
                                  <div className="mb-6">
                                      <div id="search-container"/>
                                  </div>
                                  <div className="hidden lg:block mt-5">
                                      <div className="top-4">
                                          <LatestPosts/>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </SearchComponent>
              </div>
          </div>
      </AppLayout>


  )
      ;
};

export default PostDetail;
