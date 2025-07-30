import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { router, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: { id: number; name: string; slug: string };
}

export function TagDialog({ isOpen, onClose, tag }: TagDialogProps) {
  const isEditing = !!tag;
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: tag?.name || '',
  });

  useEffect(() => {
    if (tag) {
      setData({ name: tag.name });
    } else {
      reset();
    }
  }, [tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(`/admin/tags/${tag.id}`, {
        onSuccess: () => {
          onClose();
          reset();
          router.visit('/admin/tags', { preserveState: true });
        },
      });
    } else {
      post('/admin/tags', {
        onSuccess: () => {
          onClose();
          reset();
          router.visit('/admin/tags', { preserveState: true });
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa thẻ' : 'Tạo thẻ mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên thẻ</Label>
              <Input
                id="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder="Nhập tên thẻ"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={processing}>
              {isEditing ? 'Cập nhật' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
