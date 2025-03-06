import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Command } from "@/Components/ui/command";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface PaginationData {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface SearchComponentProps {
    initialSearch?: string;
    route: string;
    children: React.ReactNode;
    pagination?: PaginationData | null;
}

const useDebounce = (value: string, delay: number = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const SearchComponent: React.FC<SearchComponentProps> = ({
                                                             initialSearch = "",
                                                             route,
                                                             children,
                                                             pagination = null,
                                                         }) => {
    const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const { url } = usePage<{ url: string }>();

    useEffect(() => {
        if (debouncedSearch !== initialSearch) {
            setIsLoading(true);
            router.get(
                route,
                { search: debouncedSearch, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsLoading(false),
                }
            );
        }
    }, [debouncedSearch, initialSearch, route]);

    const searchInput = (
        <div className="w-full ">
            <Command className="rounded-lg border  shadow-md w-full">
                <div className="flex items-center px-3 py-1.5 w-full">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-0 h-8 text-sm focus:ring-0 focus-visible:ring-0 placeholder:text-gray-400"
                    />
                    {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />}
                </div>
            </Command>
        </div>
    );

    return (
        <>
            {/* Portal the search input to the sidebar container */}
            {typeof document !== 'undefined' && document.getElementById('search-container') &&
                createPortal(searchInput, document.getElementById('search-container')!)}

            {/* Main content with search results */}
            <div className={cn("w-full space-y-1", isLoading && "opacity-70")}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center /50 z-50 w-1/2">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                    </div>
                )}

                {/* Content */}

                 {children}
            </div>
        </>
    );
};

export default SearchComponent;
