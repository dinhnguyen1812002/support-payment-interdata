// CategoryContext.tsx
import { createContext, useContext, ReactNode } from "react";
import React from 'react'

interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}

interface CategoryContextType {
    categories: Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode; initialCategories: Category[] }> = ({
    children,
    initialCategories,
}) => {
    return (
       
       <CategoryContext.Provider value={{ categories :  initialCategories }}>

       </CategoryContext.Provider>
    );
};

// Hook để sử dụng Context
export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategory must be used within a CategoryProvider");
    }
    return context;
};