import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EditPostProps {
    post: {
        id: number;
        title: string;
        content: string;
        slug: string;
        is_published: boolean;
        images?: string[]; // URLs of existing images
    };
}

const EditPost = ({ post }: EditPostProps) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: post.title || '',
        content: post.content || '',
        is_published: post.is_published || false,
        images: [] as File[],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>(post.images || []);
    const quillRef = useRef(null);

    // Handle File Input Changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files as FileList);
            setData('images', files);

            // Generate image previews
            const previews = files.map((file) => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...previews]);
        }
    };

    // Handle Content Changes
    const handleContentChange = (value: string) => {
        setData('content', value);
    };

    // Handle Form Submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/posts/${post.id}/`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                alert('Bài viết đã được chỉnh sửa thành công!');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <AppLayout title="Edit Post" canLogin={true} canRegister={true}>
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
                <h1 className="text-2xl font-bold mb-4">Chỉnh sửa bài viết</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Field */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Tiêu đề
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Nhập tiêu đề bài viết"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                            Nội dung
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={data.content}
                            onChange={handleContentChange}
                            modules={{
                                toolbar: [
                                    ['bold', 'italic', 'underline'],
                                    [{ header: [1, 2, false] }],
                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                    ['link', 'image'],
                                ],
                            }}
                            placeholder="Nhập nội dung bài viết"
                        />
                        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                    </div>

                    {/* Multiple Images Field */}
                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                            Hình ảnh
                        </label>
                        <input
                            id="images"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                        />
                        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                        <div className="mt-4 flex space-x-4">
                            {imagePreviews.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Preview ${index + 1}`}
                                    className="h-20 w-20 object-cover rounded-md shadow-md"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Is Public Field */}
                    <div className="flex items-center space-x-2">
                        <input
                            id="is_public"
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                            Công khai bài viết
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Đang xử lý...' : 'Cập nhật bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default EditPost;
