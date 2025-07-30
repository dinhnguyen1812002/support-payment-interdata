import React, { useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import TicketLayout from '@/Layouts/TicketLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import QuillEditor from '@/Components/QuillEditor';
import SearchComponent from '@/Components/Search';
import SearchInput from '@/Components/search-input';
import SingleTagInput, { MultiSelectInput } from '@/Components/tag-input';
import { cn } from '@/lib/utils';
import { Switch } from '@radix-ui/react-switch';

import { Sidebar, AlertCircle, Loader2 } from 'lucide-react';
import { Label } from '@/Components/ui/label';
import ReactQuill from 'react-quill';
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from '@/Components/ui/tooltip';
import { Category, Department, Notification, Tag } from '@/types';

interface CreateTicketProps {
  categories: Category[];
  departments: Department[];
  notifications: Notification[];
  tags: Tag[];
}

const CreateTicket: React.FC<CreateTicketProps> = ({
  categories = [],
  departments = [],
  notifications,
  tags = [],
}) => {
  const title = 'Tạo yêu cầu hỗ trợ mới';

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

  return (
    <TicketLayout
      title={title}
      notifications={notifications}
      showSidebar={true} // Không hiển thị sidebar cho trang create
      backUrl="/tickets"
      backLabel="Quay lại danh sách yêu cầu"
      showTabs={false}
      showCreateButton={false}
      categories={categories}
      tags={tags}
      showLable={false}
    >
      <div className="container mx-auto lg:px-4">
        <div className="relative flex-1 mx-auto px-0 pl-6 lg:pl-5 mt-0 lg:w-full">
          <div className="hidden lg:block absolute top-4 left-0 w-[1px] h-[calc(100%-2rem)]  "></div>
          <div className="">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Đặt câu hỏi
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
                    Tiêu đề{' '}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-red-500 mr-1">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vui lòng nhập tiêu đề</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Tiêu đề câu hỏi của bạn"
                    className={cn(
                      'h-10 dark:text-[#9a9cae]',
                      errors.title && 'ring-2 ring-red-500',
                    )}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="text-base font-bold text-customBlue1 flex"
                  >
                    Câu hỏi
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-red-500 mr-1">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="tt">Nhập câu hỏi của bạn</p>
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
                      <AlertCircle className="w-4 h-4 mr-1" /> {errors.content}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2 mt-10">
                  <Label className="text-base flex items-center mt-14 text-customBlue1 font-bold">
                    Thẻ
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-red-500 mr-1">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chọn một thẻ</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>

                  <SingleTagInput
                    options={tags}
                    selectedTag={selectedTag}
                    setSelectedTag={tagId => handleTagSelect(tagId)}
                    placeholder="Chọn một thẻ..."
                  />

                  {errors.tags && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" /> {errors.tags}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-2 mt-5">
                  <Label className="text-base flex items-center text-customBlue1 font-bold">
                    Danh mục
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-red-500 mr-1">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chọn ít nhất một (tối đa 3)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>

                  <MultiSelectInput
                    options={categories}
                    selectedItems={data.categories}
                    setSelectedItems={handleCategoryChange}
                    placeholder="Tìm kiếm và chọn danh mục..."
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
                      Công khai
                    </Label>
                  </div>
                  <Button type="submit" disabled={processing} variant="default">
                    {processing ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Đang xử lý...
                      </div>
                    ) : (
                      'Gửi'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      </div>
    </TicketLayout>
  );
};

export default CreateTicket;
