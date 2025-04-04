import React, { useState, useRef, forwardRef } from 'react';
import {router, useForm} from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

import 'react-quill/dist/quill.snow.css';
import { CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { AlertCircle, Hash, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import CategoriesSidebar from '@/Pages/Categories/CategoriesSidebar';
import { Category, Notification } from '@/types';
import LatestPosts from '@/Pages/Posts/LatestPost';

import SearchComponent from '@/Components/Search';

import Sidebar from '@/Components/Sidebar';
import QuillEditor from "@/Components/QuillEditor";
import ReactQuill from "react-quill";
import SearchInput from "@/Components/search-input";

interface CreatePostProps {
  categories: Category[];
  notifications: Notification[];
  keyword: string;
}

const CreatePost = (
  { categories, notifications, keyword }: CreatePostProps,
  category: Category,
) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySearchFocused, setCategorySearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
    const quillRef = useRef<ReactQuill>(null);

const ref = useRef();
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    content: '',
    is_published: false,
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
    setData(
      'categories',
      data.categories.filter(id => id !== categoryId),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/new-post', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setDialogOpen(true);
      },
      onError: errors => {
        console.error('Form submission errors:', errors);
      },
    });
  };

  const selectedCategories = categories.filter(category =>
    data.categories.includes(category.id),
  );

  const filteredCategories = categories.filter(
    category =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !data.categories.includes(category.id),
  );
    const handleSearch = (value: string) => {
        if (value.trim()) {
            router.get("/posts/search", { search: value, page: 1 });
        }
    };
  const title = 'Ask Question';
  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className="max-w-[1354px] mx-auto lg:px-4">
        <div className="flex">
          {/* Main Content Area with Search Functionality */}
          <SearchComponent initialSearch={keyword} route="/posts/search">
            <div className="flex  gap-x-4">
              {/* Left Sidebar */}
              <div className="hidden lg:block w-52 pr-2 ml-[-10px]">
                <Sidebar categories={[]} />
              </div>
              <div className="relative flex-1 max-w-5xl mx-auto px-0 pl-6 lg:pl-5 mt-0 lg:w-full">
                <div className="hidden lg:block absolute top-4 left-0 w-[1px] h-[calc(100%-2rem)] border-l "></div>
                <div className="">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                      Ask a Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title Input */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="title"
                          className="text-base font-bold text-customBlue1 "
                        >
                          Title{' '}
                          <span className=" font-bold text-mutedText text-sm ">
                            *
                          </span>
                        </Label>
                        <Input
                          id="title"
                          value={data.title}
                          onChange={e => setData('title', e.target.value)}
                          placeholder="Your question title"
                          className={cn(
                            'h-10 dark:text-[#9a9cae]',
                            errors.title && 'ring-2 ring-red-500',
                          )}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />{' '}
                            {errors.title}
                          </p>
                        )}
                      </div>
                      {/* Content Editor */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="content"
                          className="text-base font-bold  text-customBlue1"
                        >
                          Question <span className="text-red-500">*</span>
                        </Label>
                        <div className="rounded-sm  ">
                            <QuillEditor
                                ref={quillRef}
                                theme="snow"
                                value={data.content}
                                onChange={(value) => setData("content", value)}
                                className="h-64 rounded-sm text-base font-bold  text-customBlue1 dark:text-[#9a9cae]"
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'underline'],
                                        [{'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ]
                                }}
                            />
                        </div>
                        {errors.content && (
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />{' '}
                            {errors.content}
                          </p>
                        )}
                      </div>
                      {/* Categories */}
                      <div className="space-y-2 mt-10 ">
                        <Label className="text-base flex items-center mt-14  text-customBlue1 font-bold ">
                          Category <span className="text-red-500">*</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {/*({data.categories.length}/3)*/}
                              Please choose least one
                          </span>
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedCategories.map(category => (
                            <Badge
                              key={category.id}
                              variant="outline"
                              className="px-3 py-1.5 text-sm flex items-center gap-1"
                            >
                              {category.title}
                              <button
                                type="button"
                                onClick={() =>
                                  handleCategoryRemove(category.id)
                                }
                                className="ml-1 hover:bg-primary-dark rounded-full p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="relative">
                          <Input
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={() => setCategorySearchFocused(true)}
                            onBlur={() =>
                              setTimeout(
                                () => setCategorySearchFocused(false),
                                200,
                              )
                            }
                            className="h-12"
                            disabled={data.categories.length >= 3}
                          />
                          {categorySearchFocused &&
                            filteredCategories.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#0F1014] text-customBlue1 rounded-md border shadow-lg max-h-60 overflow-auto">
                                {filteredCategories.map(category => (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                      handleCategorySelect(category.id)
                                    }
                                    className="w-full px-4 py-2 text-left hover:text-blue-500 flex items-center gap-2 "
                                  >
                                    <Hash className="w-4 h-4 text-muted-foreground" />
                                    {category.title}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-5">
                        <div className="flex-1 flex items-center p-4 rounded-lg">
                          <Switch disabled={false}
                            id="is_published"
                            checked={data.is_published}
                            onCheckedChange={checked =>
                              setData('is_published', checked)
                            }
                            className="mr-2"
                          />
                          <Label
                            htmlFor="is_published"
                            className="font-medium cursor-pointer"
                          >
                            Public
                          </Label>
                        </div>
                        <Button
                          type="submit"
                          disabled={processing}
                          className="h-10 px-6 sm:w-50 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {processing ? (
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Đang xử lý...
                            </div>
                          ) : (
                            'Thêm bài viết'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block w-72 mt-5">
                <div className="top-4">
                  <div className="mb-6">
                      <SearchInput
                          placeholder="Tìm kiếm..."
                          onSearch={handleSearch}
                      />
                  </div>
                  <div className="hidden lg:block mt-5">
                    <div className="top-4">
                      <LatestPosts />
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
