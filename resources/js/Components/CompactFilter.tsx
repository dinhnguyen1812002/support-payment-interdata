import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { router } from "@inertiajs/react";

interface FilterOptionProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CompactFilterProps {
    value: string;
    onValueChange?: (value: string) => void;
    options: FilterOptionProps[];
    label?: string;
    queryParam?: string;
    preserveState?: boolean;
    className?: string;
}

const CompactFilter: React.FC<CompactFilterProps> = ({
                                                         value,
                                                         onValueChange,
                                                         options,
                                                         label = "Sắp xếp",
                                                         queryParam = "sort",
                                                         preserveState = true,
                                                         className = "",
                                                     }) => {
    const handleValueChange = (newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        }

        router.get(
            window.location.pathname,
            { [queryParam]: newValue },
            { preserveState }
        );
    };

    const currentOption = options.find(option => option.value === value);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${className}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {label}
                    {currentOption && `: ${currentOption.label}`}
                    <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleValueChange(option.value)}
                        className="flex items-center gap-2"
                    >
                        {option.icon}
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CompactFilter;
