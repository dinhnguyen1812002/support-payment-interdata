import React, {useState} from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}

interface Props {
    selectedCategory?: string | null | undefined;
    className?: string;
    categories: Category[];
    onCategorySelect?: () => void;
}


import { ChevronDown, ChevronUp } from "lucide-react";

const CategoriesSidebar: React.FC<Props> = ({
                                                categories,
                                                selectedCategory,
                                                className = "",
                                                onCategorySelect,
                                            }) => {
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 5; // Số lượng danh mục hiển thị ban đầu

    const visibleCategories = showAll ? categories : categories.slice(0, INITIAL_SHOW_COUNT);
    const hasMoreCategories = categories.length > INITIAL_SHOW_COUNT;

    return (
        <div className={`mt-10 lg:max-w-7xl ${className}`}>
            <div>
                <h3 className="ml-5 text-lg font-normal text-gray-500">Danh mục</h3>
            </div>
            <div className="p-0">
                <div className="space-y-1">
                    {/* 🏠 Button "Tất cả" quay về Home */}
                    <Button
                        variant="ghost"
                        className={`w-full justify-between hover:bg-slate-100 px-4 py-2 h-auto relative ${
                            !selectedCategory
                                ? "border-l-4 bg-slate-100 border-l-blue-600"
                                : "border-l-2 border-l-transparent"
                        }`}
                        asChild
                    >
                        <Link
                            href="/"
                            className="flex justify-between items-center w-full text-sm text-gray-600 hover:text-gray-900"
                        >
                            <div className="flex gap-2 items-center">
                                <span className={`font-normal ${!selectedCategory ? "text-blue-600" : ""}`}>
                                    Tất cả
                                </span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {categories.reduce((acc, category) => acc + (category.posts_count || 0), 0)}
                            </span>
                        </Link>
                    </Button>

                    {/* Danh sách danh mục */}
                    {visibleCategories.map((category) => {
                        const isActive = selectedCategory === category.slug;
                        return (
                            <Button
                                key={category.id}
                                variant="ghost"
                                className={`w-full justify-between hover:bg-slate-100 px-4 py-2 h-auto relative ${
                                    isActive
                                        ? "border-l-4 bg-slate-100 border-l-blue-600"
                                        : "border-l-2 border-l-transparent"
                                }`}
                                asChild
                                onClick={onCategorySelect}
                            >
                                <Link
                                    href={`/categories/${category.slug}/posts`}
                                    className="flex justify-between items-center w-full text-sm text-gray-600 hover:text-gray-900"
                                >
                                    <div className="flex gap-2 items-center">
                                        <span className={`font-normal ${isActive ? "text-blue-600" : ""}`}>
                                            {category.title}
                                        </span>
                                    </div>
                                    {category.posts_count !== undefined && (
                                        <span className="text-sm text-gray-500">
                                            {category.posts_count}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        );
                    })}

                    {/* Show More/Less Button */}
                    {hasMoreCategories && (
                        <Button
                            variant="ghost"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-start justify-start gap-2 mt-2"
                        >
                            {showAll ? (
                                <>
                                    Show Less <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Show More <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesSidebar;
