import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RichTextEditor from '@/Components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

import { router } from '@inertiajs/react';
import { z } from 'zod';
import { route } from 'ziggy-js';


// Define Public type (visibility)
type PublicType = 'public' | 'private';

const publicOptions: { value: PublicType; label: string }[] = [
  { value: 'public', label: 'Công khai - Hiển thị cho mọi người' },
  { value: 'private', label: 'Riêng tư - Chỉ hiển thị cho nhân viên' },
];

// Zod validation schema
const createTicketSchema = z.object({
  title: z.string()
    .min(1, 'Tiêu đề là bắt buộc')
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề phải ít hơn 200 ký tự'),
  description: z.string()
    .min(1, 'Mô tả là bắt buộc')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(1000, 'Mô tả phải ít hơn 1000 ký tự'),
  selectedCategory: z.number({
    required_error: 'Vui lòng chọn danh mục',
    invalid_type_error: 'Vui lòng chọn danh mục hợp lệ',
  }).min(1, 'Vui lòng chọn danh mục'),
  selectedTag: z.number({
    required_error: 'Vui lòng chọn thẻ',
    invalid_type_error: 'Vui lòng chọn thẻ hợp lệ',
  }).min(1, 'Vui lòng chọn thẻ'),
  isPublic: z.enum(['public', 'private'], {
    required_error: 'Vui lòng chọn chế độ hiển thị',
  }),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

interface CreateTicketDialogProps {
  categories?: any[];
  tags?: any[];
}

export function CreateTicketDialog({ categories = [], tags = [] }: CreateTicketDialogProps) {

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState<PublicType>('public');
  const [selectedTag, setSelectedTag] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation helpers
  const validateField = (field: keyof CreateTicketFormData, value: any) => {
    try {
      const fieldSchema = createTicketSchema.shape[field];
      fieldSchema.parse(value);

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      // if (error instanceof z.ZodError) {
      //   setErrors(prev => ({
      //     ...prev,
      //     [field]: error.errors[0].message
      //   }));
      // }
    }
  };

  const validateForm = (): boolean => {
    try {
      // Strip HTML tags from description for validation
      const textDescription = description.replace(/<[^>]*>/g, '').trim();

      // Validate using Zod schema
      createTicketSchema.parse({
        title: title.trim(),
        description: textDescription,
        selectedCategory: selectedCategory || undefined,
        selectedTag: selectedTag || undefined,
        isPublic,
      });

      // Clear errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const newErrors: Record<string, string> = {};

        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });

        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    router.post(route('posts.store'), {
      title: title.trim(),
      content: description, // Send HTML content
      categories: [selectedCategory],
      tags: [selectedTag],
      is_published: isPublic === 'public' ? 1 : 0,
    }, {
      onSuccess: () => {
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedCategory('');
        setSelectedTag('');
        setIsPublic('public');
        setErrors({});
        setOpen(false);
        setIsSubmitting(false);
      },
      onError: (formErrors) => {
        setErrors(formErrors as Record<string, string>);
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
         Tạo ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu hỗ trợ mới</DialogTitle>
          <DialogDescription>
            Mô tả vấn đề hoặc câu hỏi của bạn và đội ngũ hỗ trợ sẽ giúp bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Mô tả ngắn gọn về vấn đề của bạn"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                validateField('title', e.target.value.trim());
              }}
              className={errors.title ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {title.length}/200
              </p>
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select
                value={selectedCategory.toString()}
                onValueChange={(value) => {
                  const categoryId = parseInt(value);
                  setSelectedCategory(categoryId);
                  validateField('selectedCategory', categoryId);
                }}
              >
                <SelectTrigger className={errors.selectedCategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedCategory && (
                <p className="text-sm text-red-500">{errors.selectedCategory}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Chế độ hiển thị *</Label>
              <Select value={isPublic} onValueChange={(value) => {
                const publicValue = value as PublicType;
                setIsPublic(publicValue);
                validateField('isPublic', publicValue);
              }}>
                <SelectTrigger className={errors.isPublic ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {publicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.isPublic && (
                <p className="text-sm text-red-500">{errors.isPublic}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả *</Label>
            <RichTextEditor
              value={description}
              onChange={(value) => {
                setDescription(value);
                // Strip HTML tags for validation
                const textContent = value.replace(/<[^>]*>/g, '');
                validateField('description', textContent.trim());
              }}
              placeholder="Vui lòng cung cấp thông tin chi  tiết về vấn đề của bạn, bao gồm các bước tái tạo nếu có..."
              className={errors.description ? 'border-red-500' : ''}
              minHeight="120px"
              maxHeight="200px"
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {description.replace(/<[^>]*>/g, '').length}/2000
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Thẻ *</Label>
            <Select
              value={selectedTag.toString()}
              onValueChange={(value) => {
                const tagId = parseInt(value);
                setSelectedTag(tagId);
                validateField('selectedTag', tagId);
              }}
            >
              <SelectTrigger className={errors.selectedTag ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn thẻ" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedTag && (
              <p className="text-sm text-red-500">{errors.selectedTag}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.replace(/<[^>]*>/g, '').trim()}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo yêu cầu hỗ trợ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}