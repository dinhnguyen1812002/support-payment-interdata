import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { Loader2, PenLine, Globe2, Eye, Hash, X, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/Components/ui/button';
import { Badge } from "@/Components/ui/badge";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import {BlogPost, Category, Notification} from "@/types";
import LatestPosts from "@/Pages/Posts/LatestPost";
interface EditPostProps {

    post: {
        id: number;
        title: string;
        content: string;
        slug: string;
        is_published: boolean;
        categories?: number[];
    };
    categories:Category[];
    notifications:Notification[]

}



const EditPost = ({ post, categories , notifications }: EditPostProps) => {
    const [categorySearchFocused, setCategorySearchFocused] = useState(false);
    const quillRef = useRef<ReactQuill>(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        title: post.title || '',
        content: post.content || '',
        is_published: post.is_published || false,
        categories: post.categories || [],
    });
    const [showCategories, setShowCategories] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.categories || data.categories.length === 0) {
            alert("Hãy chọn ít nhất một danh mục.");
            return;
        }

        put(`/posts/${post.id}`, {
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
    const filteredCategories = categories.filter(
        category =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !data.categories.includes(category.id)
    );

    // Handle category selection
    const handleCategorySelect = (categoryId: number) => {
        if (data.categories.length < 3) {
            setData('categories', [...data.categories, categoryId]);
            setSearchTerm('');
        }
    };

    // Handle category removal
    const handleCategoryRemove = (categoryId: number) => {
        setData('categories', data.categories.filter(id => id !== categoryId));
    };

    // Get selected category objects
    const selectedCategoryObjects = categories.filter(category =>
        data.categories.includes(category.id)
    );


    return (
        <AppLayout title={'Post'} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main content with categories sidebar */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-6">
                        {/* Categories Sidebar */}
                        <div className="hidden lg:block lg:w-64 ">
                            <div className="sticky top-20">
                                <CategoriesSidebar
                                    categories={categories}
                                    selectedCategory={null}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"></div>
                        <div className="flex-1 max-w-3xl mt-10">
                            <Card className="border-none shadow-md">
                                <CardHeader className="space-y-3 pb-4 border-b">
                                    <div className="flex items-center space-x-2">
                                        <PenLine className="w-5 h-5 text-primary"/>
                                        <CardTitle className="text-2xl font-semibold">Thêm bài viết</CardTitle>
                                    </div>
                                    <CardDescription className="text-base">
                                        Tạo bài viết mới cho cộng đồng của bạn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-base font-medium flex items-center">
                                                Tiêu đề <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData("title", e.target.value)}
                                                placeholder="Nhập tiêu đề bài viết của bạn"
                                                className={cn(
                                                    "h-12 text-base px-4",
                                                    errors.title ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-primary"
                                                )}
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-500 flex items-center mt-1">
                                                    <AlertCircle className="w-4 h-4 mr-1"/> {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-base font-medium flex items-center">
                                                Danh mục <span className="text-red-500 ml-1">*</span>
                                                <span className="text-sm text-muted-foreground ml-2">
                                                  ({data.categories.length}/3 danh mục)
                                                </span>
                                            </Label>

                                            {/* Selected Categories */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedCategoryObjects.map((category) => (
                                                    <Badge
                                                        key={category.id}
                                                        variant="default"
                                                        className="px-3 py-1.5 text-sm flex items-center gap-1"
                                                    >
                                                        <Hash className="w-3.5 h-3.5"/>
                                                        {category.title}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCategoryRemove(category.id)}
                                                            className="ml-1 hover:bg-primary-dark rounded-full p-0.5"
                                                        >
                                                            <X className="w-3.5 h-3.5"/>
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Category Search */}
                                            <div className="relative">
                                                <Input
                                                    placeholder="Tìm kiếm danh mục..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onFocus={() => setCategorySearchFocused(true)}
                                                    onBlur={() => setTimeout(() => setCategorySearchFocused(false), 200)}
                                                    className="h-12 text-base px-4"
                                                    disabled={data.categories.length >= 3}
                                                />
                                                {categorySearchFocused && filteredCategories.length > 0 && (
                                                    <div
                                                        className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg max-h-60 overflow-auto">
                                                        {filteredCategories.map((category) => (
                                                            <button
                                                                key={category.id}
                                                                type="button"
                                                                onClick={() => handleCategorySelect(category.id)}
                                                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                <Hash className="w-4 h-4 text-muted-foreground"/>
                                                                {category.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {errors.categories && (
                                                <p className="text-sm text-red-500 flex items-center mt-1">
                                                    <AlertCircle className="w-4 h-4 mr-1"/> {errors.categories}
                                                </p>
                                            )}
                                        </div>

                                        {/* Content Editor */}
                                        <div className="space-y-2">
                                            <Label htmlFor="content"
                                                   className="text-base font-medium flex items-center">
                                                Nội dung <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <div className="border rounded-lg">
                                                <ReactQuill
                                                    ref={quillRef}
                                                    theme="snow"
                                                    value={data.content}
                                                    onChange={(value) => setData("content", value)}
                                                    placeholder="Nhập nội dung bài viết"
                                                    className="h-64"
                                                    modules={{
                                                        toolbar: [
                                                            ['bold', 'italic', 'underline'],
                                                            [{'list': 'ordered'}, {'list': 'bullet'}],
                                                            ['link', 'image'],
                                                            ['clean']
                                                        ]
                                                    }}
                                                />
                                            </div>
                                            {errors.content && (
                                                <p className="text-sm text-red-500 flex items-center mt-1">
                                                    <AlertCircle className="w-4 h-4 mr-1"/> {errors.content}
                                                </p>
                                            )}
                                        </div>

                                        {/* Visibility Settings */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="space-y-1">
                                                <Label htmlFor="is_published"
                                                       className="text-base font-medium flex items-center">
                                                    <Globe2 className="w-4 h-4 mr-2"/>
                                                    Công khai bài viết
                                                </Label>
                                                <p className="text-sm text-muted-foreground flex items-center">
                                                    <Eye className="w-4 h-4 mr-2"/>
                                                    Bài viết sẽ hiển thị công khai với mọi người
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_published"
                                                checked={data.is_published}
                                                onCheckedChange={(checked) => setData("is_published", checked)}
                                                className="scale-110"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-12 text-base font-medium"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2"/>
                                                    Đang xử lý...
                                                </div>
                                            ) : (
                                                "Thêm bài viết"
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>

        // <AppLayout title="Edit Post" canLogin={true} canRegister={true}>
        //     <div className="max-w-3xl mx-auto p-4 md:p-6">
        //
        //     </div>
        // </AppLayout>
    );
};

export default EditPost;
