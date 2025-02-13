import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { router } from "@inertiajs/react";

interface FilterSelectProps {
    value: string;
    onValueChange?: (value: string) => void;
    options: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
    preserveState?: boolean;
    queryParam?: string;
    className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
                                                       value,
                                                       onValueChange,
                                                       options,
                                                       placeholder = "Select an option",
                                                       preserveState = true,
                                                       queryParam = "sort",
                                                       className = "",
                                                   }) => {
    const handleValueChange = (newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        }

        // Update URL with new filter value
        router.get(
            window.location.pathname,
            { [queryParam]: newValue },
            { preserveState }
        );
    };

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className={`w-[180px] ${className}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default FilterSelect;
