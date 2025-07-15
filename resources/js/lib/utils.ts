import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFirstTwoLetters(name: string): string {
    return name.trim().slice(0, 2).toUpperCase(); // Bỏ khoảng trắng và lấy 2 chữ cái đầu
}
export function formatDate(date: string): string {
    try {
        if (!date) return 'Invalid date';
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid date';

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    } catch (error) {
        return 'Invalid date';
    }
}

export const getAvatarUrl = (user: { name: string; profile_photo_path: string | null }) => {
    return user.profile_photo_path
        ? `/storage/${user.profile_photo_path}`
        : null;
};

export const formatTimeAgo = (dateString: string) => {
    try {
        if (!dateString) return 'Invalid date';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return `${diffSecs} seconds ago`;
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 30) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    } catch (error) {
        return 'Invalid date';
    }
};
