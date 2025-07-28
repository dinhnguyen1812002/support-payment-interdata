import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";

interface CommentsPaginationProps {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const CommentsPagination: React.FC<CommentsPaginationProps> = ({
    current_page,
    last_page,
    next_page_url,
    prev_page_url,
    onPageChange,
    isLoading = false,
}) => {
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        const delta = 1;

        const rangeStart = Math.max(2, current_page - delta);
        const rangeEnd = Math.min(last_page - 1, current_page + delta);

        if (last_page > 1) {
            pages.push(1);
        }
        if (rangeStart > 2) {
            pages.push("...");
        }
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }
        if (rangeEnd < last_page - 1) {
            pages.push("...");
        }
        if (last_page > 1 && !pages.includes(last_page)) {
            pages.push(last_page);
        }
        return pages;
    };

    const handlePageClick = (page: number) => {
        if (isLoading || page === current_page) return;
        onPageChange(page);
    };

    const handlePrevious = () => {
        if (isLoading || !prev_page_url || current_page <= 1) return;
        onPageChange(current_page - 1);
    };

    const handleNext = () => {
        if (isLoading || !next_page_url || current_page >= last_page) return;
        onPageChange(current_page + 1);
    };

    if (last_page <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                {/* Previous button */}
                <PaginationItem>
                    <PaginationPrevious 
                        onClick={handlePrevious}
                        aria-disabled={!prev_page_url || isLoading}
                        className={`cursor-pointer ${
                            !prev_page_url || isLoading 
                                ? "opacity-50 pointer-events-none" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    />
                </PaginationItem>

                {/* Page numbers */}
                {getVisiblePages().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink 
                                isActive={page === current_page}
                                onClick={() => handlePageClick(page as number)}
                                className={`cursor-pointer ${
                                    isLoading 
                                        ? "pointer-events-none opacity-50" 
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                {/* Next button */}
                <PaginationItem>
                    <PaginationNext 
                        onClick={handleNext}
                        aria-disabled={!next_page_url || isLoading}
                        className={`cursor-pointer ${
                            !next_page_url || isLoading 
                                ? "opacity-50 pointer-events-none" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default CommentsPagination;
