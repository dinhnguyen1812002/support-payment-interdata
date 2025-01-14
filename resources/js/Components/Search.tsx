import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Command, CommandInput } from '@/Components/ui/command';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import Pagination from "@/Components/Pagination";
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const SearchComponent: React.FC<SearchComponentProps> = ({
                                                             initialSearch = '',
                                                             route,
                                                             children,
                                                             pagination = null,
                                                         }) => {
    const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { url } = usePage<{ url: string }>();

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== initialSearch) {
                setIsLoading(true);
                router.get(route, {
                    search: searchTerm,
                    page: 1
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsLoading(false)
                });
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, initialSearch, route]);

    const handlePageChange = (page: number): void => {
        setIsLoading(true);
        router.get(route, {
            search: searchTerm,
            page: page
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false)
        });
    };

    return (
        <div>
            <Command className="rounded-lg border shadow-md">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
                    />
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                    )}
                </div>
            </Command>

            {/* Results Container */}
            <div className={cn(
                "min-h-[200px] relative",
                isLoading && "opacity-70"
            )}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}

                {/* Results */}
                {children}
            </div>

            {/* Pagination */}
            {pagination && pagination.total > 0 && (
                <Pagination
                    current_page={pagination.current_page}
                    last_page={pagination.last_page}
                    next_page_url={pagination.next_page_url}
                    prev_page_url={pagination.prev_page_url}
                />
            )}

            {/* No Results Message */}
            {/*{pagination && pagination.total === 0 && searchTerm && (*/}
            {/*    <Alert variant="destructive" className="bg-destructive/10">*/}
            {/*        <AlertDescription className="text-center">*/}
            {/*            Không tìm thấy bài viết nào phù hợp với "{searchTerm}"*/}
            {/*        </AlertDescription>*/}
            {/*    </Alert>*/}
            {/*)}*/}

        </div>
    );
};

export default SearchComponent;
