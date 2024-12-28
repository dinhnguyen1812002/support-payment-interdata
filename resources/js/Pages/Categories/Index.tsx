import React from "react";
import { Card, CardHeader, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types";

interface CategoriesProps {
    categories: Category[];
    onCategoryClick?: (slug: string) => void; // Prop cho sự kiện click
}

const Sidebar: React.FC<CategoriesProps> = ({ categories, onCategoryClick }) => {
    return (
        <Card className="w-64 mt-10">
            <CardHeader >
                <h3 className="text-lg font-semibold">Categories</h3>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] px-1">
                    <div className="space-y-1 p-2">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant="ghost"
                                className="w-full justify-start gap-2 font-normal hover:bg-slate-100"
                                onClick={() => onCategoryClick?.(category.slug)} // Gọi sự kiện click
                                asChild
                            >
                                <a href={`/categories/${category.slug}`}>
                                    <ChevronRight className="h-4 w-4" />
                                    {category.title}
                                </a>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default Sidebar;
