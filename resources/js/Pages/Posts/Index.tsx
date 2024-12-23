import React from 'react';

const BlogCard = () => {
    return (
        <div className="container mx-auto bg-white py-6 rounded-lg border-b border-gray-200">
            <div className="space-y-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
                {/* Content Section */}
                <div className="sm:col-span-2">
                    {/* Tags */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            {['Tag #1', 'Tag #2', 'Tag #3'].map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700
                                    bg-white rounded-full border border-gray-300"
                                >
                                      <svg
                                          className="mr-1.5 h-2 w-2"
                                          fill="currentColor"
                                          viewBox="0 0 8 8"
                                      >
                                        <circle cx="4" cy="4" r="3"></circle>
                                      </svg>
                                        {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Blog Details */}
                    <div className="mt-2">
                        <a
                            href="https://laravel.cm/articles/traquer-un-champ-validation-conditionelle-react-hook-form-5"
                            className="group"
                        >
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                                A Tailwind CSS Card for Displaying Blog Posts
                            </h4>
                        </a>
                        <p className="mt-1 text-sm text-gray-700">
                            Metus potenti velit sollicitudin porttitor magnis elit lacinia
                            tempor varius, ut cras orci vitae parturient id nisi vulputate
                            consectetur, primis venenatis cursus tristique malesuada viverra
                            congue risus.
                        </p>

                        {/* Author and Meta */}
                        <div className="mt-3 flex items-center">
                            <a href="https://stackdiary.com/">
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src="https://stackdiary.com/140x100.png"
                                    alt="John Doe"
                                />
                            </a>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    <a href="https://stackdiary.com" className="hover:underline">
                                        John Doe
                                    </a>
                                </p>
                                <div className="flex space-x-1 text-sm text-gray-500">
                                    <time dateTime="2022-02-01">1 Feb, 2022</time>
                                    <span aria-hidden="true">·</span>
                                    <span>3 min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="separator separator-dashed border-gray-300 my-8"></div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
