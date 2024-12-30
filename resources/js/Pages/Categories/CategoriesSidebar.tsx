import React from 'react';
import { Button } from "@headlessui/react";
import { Category } from "@/types";

interface Props {
    categories: Category[];
    onCategoryClick: (slug: string) => void;
    selectedCategory?: string | null;

}

const CategoriesSidebar: React.FC<Props> = ({ categories, onCategoryClick, selectedCategory }) => {
    console.log(categories);
    return (
        <div className="lg:max-w-52 mt-10">
            <h2 className="text-lg font-semibold mb-2">Categories</h2>
            <div className="space-y-1">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        onClick={() => onCategoryClick(category.slug)}
                        className={`w-full justify-between text-left px-2 font-normal hover:bg-slate-100 flex items-center ${
                            selectedCategory === category.slug ? 'bg-slate-200' : ''
                        }`}
                    >
                        {category.title}
                        <span className="ml-11">{category.posts_count || 0}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default CategoriesSidebar;
