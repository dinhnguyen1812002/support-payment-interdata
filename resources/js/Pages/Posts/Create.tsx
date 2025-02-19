import React, { useState, useRef } from 'react';
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
import LatestPosts from "@/Pages/Posts/LatestPost";
import {Separator} from "@/Components/ui/separator";



interface FromPostProps{
    categories: Category[];
    notifications:Notification[]
}

function AlterDialog(props: { open: boolean, onClose: () => void, title: string, description: string }) {
    return null;
}

const CreatePost = ({categories, notifications}:FromPostProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const quillRef = useRef<ReactQuill>(null);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/new-post', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // alert('Bài viết đã được tạo thành công!');
                setDialogOpen(true); // Mở dialog khi thành công
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <AppLayout title={"Đặt câu hỏi"} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-4">
                    {/* Left Sidebar */}
                    <div className="hidden lg:block w-56">
                        <CategoriesSidebar categories={categories} selectedCategory={selectedCategory} className="w-full" />
                    </div>

                    {/* Separator */}
                    <Separator orientation="vertical" className="hidden lg:flex h-auto mt-10" />

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl mt-10 ">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Thêm bài viết</CardTitle>
                                <CardDescription>Tạo bài viết mới cho cộng đồng của bạn</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tiêu đề</Label>
                                        <Input id="title" type="text" value={data.title} onChange={(e) => setData("title", e.target.value)} placeholder="Nhập tiêu đề" className={cn(errors.title && "ring-2 ring-red-500")} />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2 h-40 mb-6">
                                        <Label htmlFor="content">Nội dung</Label>
                                        <ReactQuill ref={quillRef} theme="snow" className="h-28" value={data.content} onChange={(value) => setData("content", value)} placeholder="Nhập nội dung bài viết" />
                                        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                                    </div>

                                    <div className="flex items-center justify-between">



                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_published">Công khai bài viết</Label>
                                            <p className="text-sm text-muted-foreground">Bài viết sẽ hiển thị công khai với mọi người</p>
                                        </div>
                                        <Switch id="is_published" checked={data.is_published} onCheckedChange={(checked) => setData("is_published", checked)} />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Thêm bài viết"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block w-64 mt-5">
                        <LatestPosts />
                    </div>
                </div>
            </div>
        </AppLayout>
    );

};

export default CreatePost;
