import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getFirstTwoLetters(name: string): string {
    return name.trim().slice(0, 2).toUpperCase(); // Bỏ khoảng trắng và lấy 2 chữ cái đầu
}
