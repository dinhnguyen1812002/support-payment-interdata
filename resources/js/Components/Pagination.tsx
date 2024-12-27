import React from "react";
import { Link } from "@inertiajs/react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";

interface PaginationProps {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

const PaginationComponent: React.FC<PaginationProps> = ({
                                                            current_page,
                                                            last_page,
                                                            next_page_url,
                                                            prev_page_url,
                                                        }) => {
    const getVisiblePages = () => {
        // Always show first and last page
        const pages: (number | string)[] = [];
        const delta = 1; // Number of pages to show before and after current page

        // Calculate range of visible pages
        const rangeStart = Math.max(2, current_page - delta);
        const rangeEnd = Math.min(last_page - 1, current_page + delta);

        // Add first page
        if (last_page > 1) {
            pages.push(1);
        }

        // Add dots if needed before range
        if (rangeStart > 2) {
            pages.push('...');
        }

        // Add pages in range
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        // Add dots if needed after range
        if (rangeEnd < last_page - 1) {
            pages.push('...');
        }

        // Add last page if it's not already included
        if (last_page > 1 && !pages.includes(last_page)) {
            pages.push(last_page);
        }

        return pages;
    };

    // Don't render pagination if there's only one page
    if (last_page <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                {/* Previous button */}
                <PaginationItem>
                    <Link
                        preserveScroll
                        href={prev_page_url ?? ''}
                        className={!prev_page_url ? 'pointer-events-none' : ''}
                    >
                        <PaginationPrevious
                            aria-disabled={!prev_page_url}
                            className={!prev_page_url ? 'opacity-50' : ''}
                        />
                    </Link>
                </PaginationItem>

                {/* Page numbers */}
                {getVisiblePages().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <Link
                                preserveScroll
                                href={`?page=${page}`}
                            >
                                <PaginationLink isActive={page === current_page}>
                                    {page}
                                </PaginationLink>
                            </Link>
                        )}
                    </PaginationItem>
                ))}

                {/* Next button */}
                <PaginationItem>
                    <Link
                        preserveScroll
                        href={next_page_url ?? ''}
                        className={!next_page_url ? 'pointer-events-none' : ''}
                    >
                        <PaginationNext
                            aria-disabled={!next_page_url}
                            className={!next_page_url ? 'opacity-50' : ''}
                        />
                    </Link>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationComponent;
