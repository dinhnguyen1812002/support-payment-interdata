import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { AlertCircle, Hash, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import { Category, Notification } from "@/types";
import LatestPosts from "@/Pages/Posts/LatestPost";
import { Separator } from "@/Components/ui/separator";
import SearchComponent from "@/Components/Search";
import BlogCard from "@/Pages/Posts/PostCard";

interface CreatePostProps {
    categories: Category[];
    notifications: Notification[];
}

const CreatePost = ({ categories, notifications }: CreatePostProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categorySearchFocused, setCategorySearchFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const quillRef = useRef<ReactQuill>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
        categories: [] as number[],
    });

    // Handlers
    const handleCategorySelect = (categoryId: number) => {
        if (data.categories.length < 3) {
            setData('categories', [...data.categories, categoryId]);
            setSearchTerm('');
        }
    };

    const handleCategoryRemove = (categoryId: number) => {
        setData('categories', data.categories.filter(id => id !== categoryId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/new-post', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDialogOpen(true);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    const selectedCategories = categories.filter((category) =>
        data.categories.includes(category.id)
    );

    const filteredCategories = categories.filter(
        (category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !data.categories.includes(category.id)
    );

    return (
        <AppLayout title={"Đặt Câu hỏi tại đây"} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-4">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block w-56">
                        <CategoriesSidebar categories={categories}   selectedCategory={selectedCategory as string | null | undefined}
                                           className="w-full"/>
                    </div>
                    {/* Separator between Sidebar and Posts */}
                    <Separator orientation="vertical" className="hidden lg:flex h-auto mt-10" />
                    {/* Main Content Area with Search Functionality */}
                    <SearchComponent
                        initialSearch={"?????"}
                        route="/posts/search"
                        // pagination={pagination}
                    >
                        <div className="flex flex-1  mt-8">
                            {/* Posts Content - Added more width */}
                            <div className="flex-1 min-w lg:mr-6">
                                <div className="">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-semibold">Thêm bài viết</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Title Input */}
                                            <div className="space-y-1">
                                                <Label htmlFor="title" className="text-base font-medium">
                                                    Tiêu đề <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={(e) => setData("title", e.target.value)}
                                                    placeholder="Nhập tiêu đề bài viết của bạn"
                                                    className={cn(
                                                        "h-12",
                                                        errors.title && "ring-2 ring-red-500"
                                                    )}
                                                />
                                                {errors.title && (
                                                    <p className="text-sm text-red-500 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1"/> {errors.title}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Content Editor */}
                                            <div className="space-y-2">
                                                <Label htmlFor="content" className="text-base font-medium">
                                                    Nội dung <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="rounded-lg ">
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
                                                    <p className="text-sm text-red-500 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1"/> {errors.content}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Categories */}
                                            <div className="space-y-2 mt-10">
                                                <Label className="text-base font-medium flex items-center">
                                                    Danh mục <span className="text-red-500">*</span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                ({data.categories.length}/3)
                                            </span>
                                                </Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedCategories.map((category) => (
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
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Tìm kiếm danh mục..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onFocus={() => setCategorySearchFocused(true)}
                                                        onBlur={() => setTimeout(() => setCategorySearchFocused(false), 200)}
                                                        className="h-12"
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
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                <div
                                                    className="flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                    <Label htmlFor="is_published"
                                                           className="font-medium cursor-pointer">
                                                        Công khai bài viết
                                                    </Label>
                                                    <Switch
                                                        id="is_published"
                                                        checked={data.is_published}
                                                        onCheckedChange={(checked) => setData("is_published", checked)}
                                                    />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-10 px-6 sm:w-1/3"
                                                >
                                                    {processing ? (
                                                        <div className="flex items-center">
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                                            Đang xử lý...
                                                        </div>
                                                    ) : (
                                                        "Thêm bài viết"
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </div>
                            </div>
                            {/* Right Sidebar - Made narrower */}
                            <div className="hidden lg:block w-64 mt-5">
                                <div className="top-4">
                                    <div className="mb-6">
                                        <div id="search-container"/>
                                    </div>
                                    <div className="hidden lg:block mt-5 ">
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
    );
};

export default CreatePost;
