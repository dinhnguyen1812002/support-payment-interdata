import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ImageUpload } from '@/Components/ui/image-upload';
import { Separator } from '@/Components/ui/separator';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Category {
  id?: number;
  title: string;
  slug: string;
  description?: string;
  logo?: string;
}

interface CategoryFormProps {
  category?: Category;
  mode: 'create' | 'edit';
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: category?.title || '',
    slug: category?.slug || '',
    description: category?.description || '',
    logo: null as File | null,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setData('title', title);
    
    // Auto-generate slug if in create mode or slug is empty
    if (mode === 'create' || !data.slug) {
      setData('slug', generateSlug(title));
    }
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setData('logo', file);
  };

  const handleLogoRemove = () => {
    if (category?.id) {
      // Call API to remove logo from server
      fetch(`/admin/categories/${category.id}/remove-logo`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
    }
    setLogoFile(null);
    setData('logo', null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('description', data.description || '');
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    if (mode === 'create') {
      post('/admin/categories', {
        data: formData,
        forceFormData: true,
        onSuccess: () => reset(),
      });
    } else if (category?.id) {
      // For update, we need to use POST with _method=PUT
      formData.append('_method', 'PUT');
      post(`/admin/categories/${category.id}`, {
        data: formData,
        forceFormData: true,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create Category' : 'Edit Category'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Add a new category with logo' 
              : 'Update category information and logo'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for the category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={handleTitleChange}
                placeholder="Enter category title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                placeholder="category-slug"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL-friendly version of the title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Enter category description"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Logo</CardTitle>
            <CardDescription>
              Upload a logo for this category (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={logoFile || category?.logo}
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              accept="image/*"
              maxSize={2}
              placeholder="Upload category logo"
              disabled={processing}
            />
            {errors.logo && (
              <p className="text-sm text-destructive mt-2">{errors.logo}</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Link href="/admin/categories">
            <Button variant="outline" disabled={processing}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={processing}>
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Category' : 'Update Category'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
