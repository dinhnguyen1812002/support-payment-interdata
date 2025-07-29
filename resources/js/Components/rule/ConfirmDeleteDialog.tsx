import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { AutomationRule } from '@/types/rules';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AutomationRule | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  rule,
  onConfirm,
  isDeleting,
}: ConfirmDeleteDialogProps) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa quy tắc
          </DialogTitle>
          <DialogDescription className="text-left">
            Bạn có chắc chắn muốn xóa quy tắc tự động này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tên quy tắc:</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{rule.name}</p>
              </div>
              {rule.description && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mô tả:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{rule.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Thứ tự: {rule.execution_order}</span>
                <span>Đã khớp: {rule.matched_count.toLocaleString()} lần</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              'Xóa quy tắc'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}