import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFirstTwoLetters(name: string): string {
    return name.trim().slice(0, 2).toUpperCase(); // Bỏ khoảng trắng và lấy 2 chữ cái đầu
}
export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}
