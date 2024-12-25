import React from 'react';

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
interface BlogCardProps {
    posts: BlogPost[];
}

const BlogCard: React.FC<BlogCardProps> = ({ posts = [] }) => { // Fallback to an empty array
    if (posts.length === 0) {
        return <p className="text-center text-gray-500">No blog posts available.</p>;
    }

    return (
        <div className="container mx-auto space-y-6">
            {posts.map((post) => (
                <div key={post.id} className="bg-white py-6 rounded-lg border-b border-gray-200">
                    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
                        {/* Content Section */}
                        <div className="sm:col-span-2">
                            {/* Tags */}
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    {/*{post.tags.map((tag, index) => (*/}
                                    {/*    <span*/}
                                    {/*        key={index}*/}
                                    {/*        className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700*/}
                                    {/*        bg-white rounded-full border border-gray-300"*/}
                                    {/*    >*/}
                                    {/*        <svg*/}
                                    {/*            className="mr-1.5 h-2 w-2"*/}
                                    {/*            fill="currentColor"*/}
                                    {/*            viewBox="0 0 8 8"*/}
                                    {/*        >*/}
                                    {/*            <circle cx="4" cy="4" r="3"></circle>*/}
                                    {/*        </svg>*/}
                                    {/*        {tag}*/}
                                    {/*    </span>*/}
                                    {/*))}*/}
                                </div>
                            </div>

                            {/* Blog Details */}
                            <div className="mt-2">
                                <a href={`/posts/${post.slug}`} className="group">
                                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                                        {post.title}
                                    </h4>
                                    {/*<h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">*/}
                                    {/*    {post.slug}*/}
                                    {/*</h4>*/}
                                </a>
                                <p className="mt-1 text-sm text-gray-700 line-clamp-3"
                                   dangerouslySetInnerHTML={{__html: post.content}}></p>

                                {/* Author and Meta */}
                                <div className="mt-3 flex items-center">
                                    <a href="#">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src={"http://localhost:8000/storage/" + post.user.profile_photo_path}
                                            alt={post.user.name}
                                        />
                                    </a>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            <a href="#" className="hover:underline">
                                                {post.user.name}
                                            </a>
                                        </p>
                                        <div className="flex space-x-1 text-sm text-gray-500">
                                            <time dateTime={post.published_at}>
                                                {new Date(post.created_at
                                                ).toLocaleDateString()}
                                            </time>
                                            <span aria-hidden="true">·</span>
                                            {/*<span>{post.read_time}</span>*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed border-gray-300 my-8"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BlogCard;
