import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CreatePost = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_published: true,
        images: [] as File[],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const quillRef = useRef(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files as FileList);
            setData('images', files);
            const previews = files.map((file) => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const handleContentChange = (value: string) => {
        setData('content', value);
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

                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung</Label>
                                <div className={cn("border rounded-md",
                                    errors.content && "ring-2 ring-red-500")}>
                                    <ReactQuill
                                        theme="snow"
                                        value={data.content}
                                        onChange={handleContentChange}
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
                            {/*<p className="text-sm text-muted-foreground">*/}
                            {/*    image upload but not need for now*/}
                            {/*</p>*/}
                            {/*<div className="space-y-2">*/}
                            {/*    <Label htmlFor="images">Hình ảnh</Label>*/}
                            {/*    <div className="grid w-full items-center gap-1.5">*/}
                            {/*        <Label*/}
                            {/*            htmlFor="images"*/}
                            {/*            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"*/}
                            {/*        >*/}
                            {/*            <div className="flex flex-col items-center justify-center pt-5 pb-6">*/}
                            {/*                <ImagePlus className="w-8 h-8 mb-4 text-gray-500" />*/}
                            {/*                <p className="mb-2 text-sm text-gray-500">*/}
                            {/*                    <span className="font-semibold">Click để tải ảnh lên</span> hoặc kéo thả vào đây*/}
                            {/*                </p>*/}
                            {/*            </div>*/}
                            {/*            <Input*/}
                            {/*                id="images"*/}
                            {/*                type="file"*/}
                            {/*                multiple*/}
                            {/*                className="hidden"*/}
                            {/*                onChange={handleFileChange}*/}
                            {/*            />*/}
                            {/*        </Label>*/}
                            {/*    </div>*/}
                            {/*    {errors.images && (*/}
                            {/*        <p className="text-sm text-red-500">{errors.images}</p>*/}
                            {/*    )}*/}
                            {/*    {imagePreviews.length > 0 && (*/}
                            {/*        <div className="grid grid-cols-4 gap-4 mt-4">*/}
                            {/*            {imagePreviews.map((src, index) => (*/}
                            {/*                <img*/}
                            {/*                    key={index}*/}
                            {/*                    src={src}*/}
                            {/*                    alt={`Preview ${index + 1}`}*/}
                            {/*                    className="h-24 w-full object-cover rounded-lg"*/}
                            {/*                />*/}
                            {/*            ))}*/}
                            {/*        </div>*/}
                            {/*    )}*/}
                            {/*</div>*/}

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
