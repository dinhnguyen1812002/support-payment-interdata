import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { ImagePlus, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/Components/ui/button';
import { Badge } from "@/Components/ui/badge";

interface EditPostProps {
    post: {
        id: number;
        title: string;
        content: string;
        slug: string;
        is_published: boolean;

        categories?: number[];
    };
    categories: Array<{ id: number; title: string }>;
}

const EditPost = ({ post, categories }: EditPostProps) => {
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

    const selectedCategories = categories.filter(category =>
        data.categories.includes(category.id)
    );

    const filteredCategories = categories.filter(category =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout title="Edit Post" canLogin={true} canRegister={true}>
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Chỉnh sửa bài viết</CardTitle>
                        <CardDescription>
                            Chỉnh sửa bài viết của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết"
                                    className={cn(errors.title && "ring-2 ring-red-500")}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2 h-40 mb-6">
                                <Label htmlFor="content">Nội dung</Label>
                                <div className={cn(" rounded-md ", errors.content && " ring-2 ring-red-500")}>
                                    <ReactQuill
                                        theme="snow"
                                        className="h-28 "
                                        value={data.content}
                                        onChange={(value) => setData('content', value)}
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline'],
                                                [{header: [1, 2, false]}],
                                                [{list: 'ordered'}, {list: 'bullet'}],
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

                            {/*<div className="space-y-2">*/}
                            {/*    <Label htmlFor="images">Hình ảnh</Label>*/}
                            {/*    <div className="mt-2">*/}
                            {/*        <Input*/}
                            {/*            id="images"*/}
                            {/*            type="file"*/}
                            {/*            multiple*/}
                            {/*            onChange={handleFileChange}*/}
                            {/*            className={cn(errors.images && "ring-2 ring-red-500")}*/}
                            {/*        />*/}
                            {/*        {errors.images && (*/}
                            {/*            <p className="text-sm text-red-500">{errors.images}</p>*/}
                            {/*        )}*/}
                            {/*        <div className="mt-4 flex flex-wrap gap-4">*/}
                            {/*            {imagePreviews.map((src, index) => (*/}
                            {/*                <img*/}
                            {/*                    key={index}*/}
                            {/*                    src={src}*/}
                            {/*                    alt={`Preview ${index + 1}`}*/}
                            {/*                    className="h-20 w-20 object-cover rounded-md"*/}
                            {/*                />*/}
                            {/*            ))}*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            <div className="space-y-2">
                                <Label>Danh mục</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedCategories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {category.title}
                                            <button
                                                type="button"
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onClick={() => {
                                                    setData('categories',
                                                        data.categories.filter(id => id !== category.id)
                                                    );
                                                }}
                                            >
                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground"/>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => setShowCategories(!showCategories)}
                                    >
                                        Chọn danh mục...
                                    </Button>
                                    {showCategories && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg">
                                            <div className="p-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Tìm kiếm danh mục..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="mb-2"
                                                />
                                                <div className="max-h-60 overflow-auto">
                                                    {filteredCategories.map((category) => {
                                                        const isSelected = data.categories.includes(category.id);
                                                        return (
                                                            <div
                                                                key={category.id}
                                                                className={cn(
                                                                    "flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 rounded-md",
                                                                    isSelected && "bg-gray-50"
                                                                )}
                                                                onClick={() => {
                                                                    setData('categories',
                                                                        isSelected
                                                                            ? data.categories.filter(id => id !== category.id)
                                                                            : [...data.categories, category.id]
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        isSelected ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {category.title}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.categories && (
                                    <p className="text-sm text-red-500">{errors.categories}</p>
                                )}
                            </div>

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

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Đang xử lý
                                    </>
                                ) : (
                                    'Cập nhật bài viết'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default EditPost;
