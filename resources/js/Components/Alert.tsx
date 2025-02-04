import { AlertDialog, AlertDialogContent,
    AlertDialogHeader, AlertDialogFooter,
    AlertDialogTitle, AlertDialogDescription,
    AlertDialogCancel } from "@/Components/ui/alert-dialog";
import React from "react";

interface SuccessDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function SuccessDialog({ open, onClose, title = "Thành công", description = "Bài viết đã được tạo thành công!" }: SuccessDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Đóng</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
