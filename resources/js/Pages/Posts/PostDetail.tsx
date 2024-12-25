import React, { useState } from 'react';
import { Clock, MessageCircle, Heart, Share2, Send } from 'lucide-react';
import AppLayout from "@/Layouts/AppLayout";

interface Comment {
    id: number;
    content: string;

    user: {
        name: string;
        profile_photo_path: string;
    };
    created_at: string;

}

interface BlogPost {
    id: number;
    title: string;
    content: string;
    user: {
        name: string;
        profile_photo_path: string;
    };
    created_at: string;
    published_at: string;
    updated_at: string;
    comments: Comment[];
}

interface PostDetailProps {
    post: BlogPost;
}

const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>(post.comments || []);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const mockComment: Comment = {
            id: Date.now(),
            content: newComment,
            user: {
                name: 'Current User',
                profile_photo_path: '/api/placeholder/40/40',
            },
            created_at: new Date().toISOString(),
        };

        setComments([...comments, mockComment]);
        setNewComment('');
    };

    return (
        <AppLayout title={post.title} canLogin={true} canRegister={true}>
            <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Article Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={
                            post.user.profile_photo_path
                                ? `/storage/${post.user.profile_photo_path}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&color=7F9CF5&background=EBF4FF`
                        }
                        alt={post.user.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div>
                        <h3 className="font-medium text-gray-900">{post.user.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1"/>
                            <time dateTime={post.created_at}>
                                {post.created_at}
                            </time>
                        </div>
                    </div>
                </div>
            </div>

                {/* Article Content */}
                <article className="prose prose-lg max-w-none mb-12">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>

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
            </div>

            {/* Comments Section */}
            <section className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex items-start space-x-4">
                        <img
                            src="/api/placeholder/40/40"
                            alt="Current user"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-grow">
              <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
              />
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-4">
                            <img
                                src={comment.user.profile_photo_path}
                                alt={comment.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-grow">
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-gray-900">{comment.user.name}</h4>
                                        <time dateTime={post.created_at}  className="text-sm text-gray-500">
                                            {post.created_at}
                                        </time>
                                    </div>
                                    <p className="text-gray-600">{comment.content}</p>
                                </div>
                                <div className="mt-2 ml-4 flex items-center space-x-4">
                                    <button className="text-sm text-gray-500 hover:text-blue-600">Reply</button>
                                    <button className="text-sm text-gray-500 hover:text-blue-600">Like</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
        </AppLayout>

    );
};

export default PostDetail;
