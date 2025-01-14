import React from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { ChevronRight } from "lucide-react";

interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}

interface Props {
    selectedCategory?: string | null | undefined; // Cho phép undefined
    className?: string;
    categories: Category[];
}

const CategoriesSidebar: React.FC<Props> = ({ categories, selectedCategory, className = "" }) => {
    return (
        <div className={`lg:max-w-52 mt-10 ${className}`}>
            <div>
                <h3 className="text-lg font-semibold ml-5">Danh mục</h3>
            </div>
            <div className="p-0">
                <ScrollArea className="h-[300px] px-1">
                    <div className="space-y-1 p-2">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category.slug;

                            return (
                                <Button
                                    key={category.id}
                                    variant="ghost"
                                    className={`w-full justify-between hover:bg-slate-100 px-2 ${
                                        isActive ? "bg-slate-100" : ""
                                    }`}
                                    asChild
                                >
                                    <a
                                        href={`/categories/${category.slug}/posts`}
                                        className="flex items-center w-full"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight
                                                className={`h-4 w-4 ${
                                                    isActive ? "text-blue-600" : "hover:text-blue-600"
                                                }`}
                                            />
                                            <span
                                                className={`font-normal ${
                                                    isActive ? "text-blue-600" : ""
                                                }`}
                                            >
                                                {category.title}
                                            </span>
                                        </div>
                                        {category.posts_count !== undefined && (
                                            <div className="ml-auto text-xs">
                                                {category.posts_count}
                                            </div>
                                        )}
                                    </a>
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default CategoriesSidebar;
