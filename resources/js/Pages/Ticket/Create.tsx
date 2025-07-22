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
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
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
  { value: 'public', label: 'Public - Visible to everyone' },
  { value: 'private', label: 'Private - Only visible to staff' },
];

// Zod validation schema
const createTicketSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  selectedCategory: z.number({
    required_error: 'Please select a category',
    invalid_type_error: 'Please select a valid category',
  }).min(1, 'Please select a category'),
  selectedTag: z.number({
    required_error: 'Please select a tag',
    invalid_type_error: 'Please select a valid tag',
  }).min(1, 'Please select a tag'),
  isPublic: z.enum(['public', 'private'], {
    required_error: 'Please select visibility',
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
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0].message
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      // Validate using Zod schema
      createTicketSchema.parse({
        title: title.trim(),
        description: description.trim(),
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
      content: description.trim(),
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
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue or question and our support team will help you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of your issue"
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
              <Label htmlFor="category">Category *</Label>
              <Select
                value={selectedCategory.toString()}
                onValueChange={(value) => {
                  const categoryId = parseInt(value);
                  setSelectedCategory(categoryId);
                  validateField('selectedCategory', categoryId);
                }}
              >
                <SelectTrigger className={errors.selectedCategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
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
              <Label htmlFor="visibility">Visibility *</Label>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateField('description', e.target.value.trim());
              }}
              className={errors.description ? 'border-red-500' : ''}
              rows={4}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {description.length}/2000
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tag *</Label>
            <Select
              value={selectedTag.toString()}
              onValueChange={(value) => {
                const tagId = parseInt(value);
                setSelectedTag(tagId);
                validateField('selectedTag', tagId);
              }}
            >
              <SelectTrigger className={errors.selectedTag ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a tag" />
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}