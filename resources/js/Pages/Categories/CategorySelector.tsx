import {Category} from "@/types";
import React from "react";
import {useMemo, useState} from "react";
import {Hash, X} from "lucide-react";
import {Input} from "@/Components/ui/input";
import {Label} from "@/Components/ui/label";
import {Badge} from "@/Components/ui/badge";

const CategorySelector = ({ categories, selectedCategories, onSelect, onRemove, searchTerm, setSearchTerm }: {
    categories: Category[];
    selectedCategories: number[];
    onSelect: (id: number) => void;
    onRemove: (id: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) => {
    const [focused, setFocused] = useState(false);

    const filteredCategories = useMemo(() => {
        return categories.filter(
            (category) =>
                category.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !selectedCategories.includes(category.id)
        );
    }, [categories, searchTerm, selectedCategories]);

    return (
        <div className="space-y-2">
            <Label className="text-base font-medium flex items-center">
                Danh mục <span className="text-red-500 ml-1">*</span>
                <span className="text-sm text-muted-foreground ml-2">
                    ({selectedCategories.length}/3 danh mục)
                </span>
            </Label>

            {/* Selected Categories */}
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedCategories.map((id) => {
                    const category = categories.find((cat) => cat.id === id);
                    return category ? (
                        <Badge key={category.id} variant="default" className="px-3 py-1.5 text-sm flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5" />
                            {category.title}
                            <button
                                type="button"
                                onClick={() => onRemove(category.id)}
                                className="ml-1 hover:bg-primary-dark rounded-full p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </Badge>
                    ) : null;
                })}
            </div>

            <div className="relative">
                <Input
                    placeholder="Tìm kiếm danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    className="h-12 text-base px-4"
                    disabled={selectedCategories.length >= 3}
                />
                {focused && filteredCategories.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg max-h-60 overflow-auto">
                        {filteredCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => onSelect(category.id)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                {category.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default CategorySelector;
