import React, { useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

import 'react-quill/dist/quill.snow.css';
import { CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Category, Notification, Tag } from '@/types';

import SearchComponent from '@/Components/Search';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import Sidebar from '@/Components/Sidebar';
import QuillEditor from '@/Components/QuillEditor';
import ReactQuill from 'react-quill';
import SearchInput from '@/Components/search-input';
import SingleTagInput, { MultiSelectInput } from '@/Components/tag-input';
import LatestPosts from '@/Pages/Posts/LatestPost';

interface CreatePostProps {
  categories: Category[];
  tags: Tag[];
  notifications: Notification[];
  keyword: string;
}
const CreatePost = ({ categories, notifications, keyword, tags }: CreatePostProps) => {
  const [selectedTag, setSelectedTag] = React.useState<number | null>(null);
  const quillRef = useRef<ReactQuill>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    content: '',
    is_published: false,
    categories: [] as number[],
    tags: [] as number[],
  });

  // Handlers
  const handleCategoryChange = (categoryIds: number[]) => {
    setData('categories', categoryIds);
  };

  // Add a handler for tag selection
  const handleTagSelect = (tagId: number | null) => {
    if (tagId !== null) {
      setData('tags', [tagId]); // This is correct: sends [tagId]
    } else {
      setData('tags', []); // This is correct: sends empty array
    }
    setSelectedTag(tagId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/new-post', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        // Post created successfully
      },
      onError: errors => {
        console.error('Form submission errors:', errors);
      },
    });
  };



  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.get('/posts/search', { search: value, page: 1 });
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
            <div className="flex gap-x-4">
              {/* Left Sidebar */}
              <div className="hidden lg:block w-52 pr-2 ml-[-10px]">
                <Sidebar categories={[]} />
              </div>
              <div className="relative flex-1 max-w-5xl mx-auto px-0 pl-6 lg:pl-5 mt-0 lg:w-full">
                <div className="hidden lg:block absolute top-4 left-0 w-[1px] h-[calc(100%-2rem)] border-l "></div>
                <div className="">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                      Ask a Question
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title Input */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="title"
                          className="text-base font-bold text-customBlue1 flex"
                        >
                          Title{' '}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-red-500 mr-1">*</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Please enter a title</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                          className="text-base font-bold text-customBlue1 flex"
                        >
                          Question
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-red-500 mr-1">*</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="tt">Enter your question</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="rounded-sm">
                          <QuillEditor
                            ref={quillRef}
                            theme="snow"
                            value={data.content}
                            onChange={value => setData('content', value)}
                            className="h-64 rounded-sm text-base font-normal text-customBlue1 dark:text-[#9a9cae]"
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline'],
                                [
                                  { list: 'ordered' },
                                  { list: 'bullet' },
                                  'code-block',
                                ],
                                ['link', 'image'],
                                ['clean'],
                              ],
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

                      {/* Tags */}
                      <div className="space-y-2 mt-10">
                        <Label className="text-base flex items-center mt-14 text-customBlue1 font-bold">
                          Tags
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-red-500 mr-1">*</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Choose one tag</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>

                        <SingleTagInput
                          options={tags} // Ensure tags is an array of objects with id and name
                          selectedTag={selectedTag}
                          setSelectedTag={tagId => handleTagSelect(tagId)}
                          placeholder="Choose a tag..."
                        />

                        {errors.tags && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="w-4 h-4 mr-1" />{' '}
                            {errors.tags}
                          </p>
                        )}
                      </div>
                  
                      {/* Categories */}
                      <div className="space-y-2 mt-5">
                        <Label className="text-base flex items-center text-customBlue1 font-bold">
                          Category
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-red-500 mr-1">*</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Choose at least one (max 3)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>

                        <MultiSelectInput
                          options={categories}
                          selectedItems={data.categories}
                          setSelectedItems={handleCategoryChange}
                          placeholder="Search and select categories..."
                          maxItems={1}
                        />

                        {errors.categories && (
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />{' '}
                            {errors.categories}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-5">
                        <div className="flex-1 flex items-center p-4 rounded-lg">
                          <Switch
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
                       variant="default"
                        >
                          {processing ? (
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            'Submit'
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
                      placeholder="Search..."
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
