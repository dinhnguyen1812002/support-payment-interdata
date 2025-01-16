import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import {Check, ImagePlus, Loader2, X} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import {Category, Notification} from "@/types";



interface FromPostProps{
    categories: Category[];
    notifications:Notification[]
}

const CreatePost = ({categories, notifications}:FromPostProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
        categories: [] as number[],
    });

    const [showCategories, setShowCategories] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCategories = categories.filter((category) =>
        data.categories.includes(category.id)
    );

    const filteredCategories = categories.filter(
        (category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !data.categories.includes(category.id)
    );

    const handleCategoryChange = (id: number) => {
        if (data.categories.includes(id)) {
            setData('categories', data.categories.filter((categoryId) => categoryId !== id));
        } else {
            setData('categories', [...data.categories, id]);
            setSearchTerm('');
        }
    };
    console.log(categories);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/new-post', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                alert('Bài viết đã được tạo thành công!');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (

    <AppLayout title={'Post'} canLogin={true} canRegister={true} notifications={notifications}>
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content with categories sidebar */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                    {/* Categories Sidebar */}
                    <CategoriesSidebar
                        categories={categories}
                        selectedCategory={null}
                        className="lg:w-1/4"
                    />
                    <div className="mt-10 h-5/6 border-l border-dashed border-gray-300"> </div>
                    <div className="flex-1 max-w-3xl">
                        <div className="space-y-6 mt-10">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thêm bài viết</CardTitle>
                                    <CardDescription>
                                        Tạo bài viết mới cho cộng đồng của bạn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Title Input */}
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

                                        {/* Content Input */}
                                        <div className="space-y-2 h-40 mb-6">
                                            <Label htmlFor="content">Nội dung</Label>
                                            <div
                                                className={cn(
                                                    'rounded-md',
                                                    errors.content && 'ring-2 ring-red-500'
                                                )}
                                            >
                                                <ReactQuill
                                                    theme="snow"
                                                    className="h-28"
                                                    value={data.content}
                                                    onChange={(value) => setData('content', value)}
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

                                        {/* Category Selection */}
                                        <div className="space-y-2 mb-8 h-16">
                                            <Label>Danh mục</Label>
                                            <div className="relative">
                                                <div className="flex flex-wrap gap-2 p-2 bg-white border rounded-md min-h-[42px]">
                                                    {selectedCategories.map((category) => (
                                                        <Badge
                                                            key={category.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            {category.title}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCategoryChange(category.id)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    <Input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            setShowCategories(true);
                                                        }}
                                                        onFocus={() => setShowCategories(true)}
                                                        placeholder="Tìm kiếm danh mục..."
                                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm flex-1 min-w-[120px] bg-transparent"
                                                    />
                                                </div>
                                                {showCategories && filteredCategories.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                                        <div className="max-h-[200px] overflow-auto py-1">
                                                            {filteredCategories.map((category) => (
                                                                <div
                                                                    key={category.id}
                                                                    className="px-2 py-1.5 hover:bg-muted cursor-pointer"
                                                                    onClick={() => {
                                                                        handleCategoryChange(category.id);
                                                                        setShowCategories(false);
                                                                    }}
                                                                >
                                                                    {category.title}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.categories && (
                                                <p className="text-sm text-red-500">{errors.categories}</p>
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
                                        <Button type="submit" className="w-full" disabled={processing}>
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
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
    );

};

export default CreatePost;
