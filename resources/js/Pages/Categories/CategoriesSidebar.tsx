import React from 'react';
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/ui/badge";
import { route } from "ziggy-js";

interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}

interface Props {
    categories: Category[];
    selectedCategory?: string | null;
    className?: string;
}

const CategoriesSidebar: React.FC<Props> = ({
                                                categories,
                                                selectedCategory,
                                                className = ""
                                            }) => {

    return (
        <div className={`lg:max-w-52 mt-10 ${className}`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Categories</h2>
            <div className="space-y-2">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={route('categories', { slug: category.slug })}
                        className="block"
                    >
                        <Badge
                            variant={selectedCategory === category.slug ? "secondary" : "outline"}
                            className={`w-full flex justify-between items-center px-3 py-2 text-sm font-medium
                                ${selectedCategory === category.slug
                                ? 'bg-gray-200 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>{category.title}</span>
                            {category.posts_count !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                    {category.posts_count}
                                </span>
                            )}
                        </Badge>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoriesSidebar;
