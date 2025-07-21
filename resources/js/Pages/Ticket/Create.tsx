import React, { useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import 'react-quill/dist/quill.snow.css';
import { CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Category, Notification, Tag } from '@/types';
import QuillEditor from '@/Components/QuillEditor';
import ReactQuill from 'react-quill';
import SingleTagInput, { MultiSelectInput } from '@/Components/tag-input';

interface CreateTicketProps {
  categories: Category[];
  tags: Tag[];
  departments: any[];
  users: any[];
  notifications: Notification[];
}

const CreateTicket = ({ categories, tags, departments, users, notifications }: CreateTicketProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    content: '',
    priority: 'medium',
    department_id: '',
    assignee_id: '',
    categories: [] as number[],
    tags: [] as number[],
  });

  // Handlers
  const handleCategoryChange = (categoryIds: number[]) => {
    setData('categories', categoryIds);
  };

  const handleTagChange = (tagIds: number[]) => {
    setData('tags', tagIds);
  };

  const handleContentChange = (content: string) => {
    setData('content', content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.title.trim()) {
      return;
    }

    post('/tickets', {
      onSuccess: () => {
        reset();
        router.get('/tickets');
      },
      onError: (errors) => {
        console.error('Submission errors:', errors);
      },
    });
  };

  const title = 'Create New Ticket';

  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className="max-w-[1354px] mx-auto px-4">
        <div className="flex">
          <div className="flex-1 w-full max-w-4xl mx-auto mt-4 sm:mt-5 md:mt-7 px-4 sm:px-6 md:px-4">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.get('/tickets')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tickets
              </Button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Create New Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="Enter ticket title..."
                      className={cn(
                        'w-full',
                        errors.title && 'border-red-500 focus:border-red-500'
                      )}
                    />
                    {errors.title && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Priority and Department Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">
                        Priority <span className="text-red-500">*</span>
                      </Label>
                      <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                        <SelectTrigger className={cn(errors.priority && 'border-red-500')}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.priority}
                        </div>
                      )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                        <SelectTrigger className={cn(errors.department_id && 'border-red-500')}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department_id && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.department_id}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2">
                    <Label htmlFor="assignee" className="text-sm font-medium">
                      Assign to (Optional)
                    </Label>
                    <Select value={data.assignee_id || 'none'} onValueChange={(value) => setData('assignee_id', value === 'none' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No assignee</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categories</Label>
                    <MultiSelectInput
                      options={categories.map(cat => ({ id: cat.id, name: cat.title }))}
                      selectedIds={data.categories}
                      onChange={handleCategoryChange}
                      placeholder="Select categories..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags</Label>
                    <MultiSelectInput
                      options={tags.map(tag => ({ id: tag.id, name: tag.name }))}
                      selectedIds={data.tags}
                      onChange={handleTagChange}
                      placeholder="Select tags..."
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <div className={cn(
                      'border rounded-md',
                      errors.content && 'border-red-500'
                    )}>
                      <QuillEditor
                        ref={quillRef}
                        value={data.content}
                        onChange={handleContentChange}
                        placeholder="Describe your issue in detail..."
                      />
                    </div>
                    {errors.content && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.content}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.get('/tickets')}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing || !data.title.trim()}
                      className="min-w-[120px]"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Ticket'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateTicket;
