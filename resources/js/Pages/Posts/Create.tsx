import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const CreatePost = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
        category: [] as string[], // Changed to array for multiple categories

    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState<string>(''); // State to handle input for new category

    const categories = ['Technology', 'Health', 'Business', 'Sports']; // Define available categories

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         const files = Array.from(e.target.files as FileList);
    //         setData('images', files);
    //         const previews = files.map((file) => URL.createObjectURL(file));
    //         setImagePreviews(previews);
    //     }
    // };

    const handleContentChange = (value: string) => {
        setData('content', value);
    };

    const handleCategoryAdd = () => {
        if (!(!newCategory || data.category.includes(newCategory))) {
            setData('category', [...data.category, newCategory]);
            setNewCategory(''); // Clear input after adding
        }
    };

    const handleCategoryRemove = (category: string) => {
        setData('category', data.category.filter((item) => item !== category));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/posts', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                alert('Bài viết đã được tạo thành công!');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <AppLayout title="Create Post" canLogin={true} canRegister={true}>
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thêm bài viết</CardTitle>
                        <CardDescription>
                            Tạo bài viết mới cho cộng đồng của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết"
                                    className={cn(errors.title && 'ring-2 ring-red-500')}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung</Label>
                                <div
                                    className={cn(
                                        'border rounded-md',
                                        errors.content && 'ring-2 ring-red-500',
                                    )}
                                >
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
                                </div>
                                {errors.content && (
                                    <p className="text-sm text-red-500">{errors.content}</p>
                                )}
                            </div>

                            {/* Category Selector - Multiple Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Danh mục</Label>
                                <div className="flex flex-wrap gap-2">
                                    {data.category.map((category) => (
                                        <div
                                            key={category}
                                            className="flex items-center space-x-2 bg-gray-200 px-2 py-1 rounded-full"
                                        >
                                            <span>{category}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCategoryRemove(category)}
                                                className="text-red-500"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleCategoryAdd();
                                                }
                                            }}
                                            placeholder="Nhập danh mục"
                                            className="border rounded-md px-2 py-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCategoryAdd}
                                            className="bg-blue-500 text-white px-4 py-1 rounded-md"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>
                                {errors.category && (
                                    <p className="text-sm text-red-500">{errors.category}</p>
                                )}
                            </div>

                            {/* Publish Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_published">Công khai bài viết</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Bài viết sẽ hiển thị công khai với mọi người
                                    </p>
                                </div>
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý
                                    </>
                                ) : (
                                    'Thêm bài viết'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default CreatePost;
