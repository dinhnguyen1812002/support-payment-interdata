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

    if (last_page <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                {/* Previous button */}
                <PaginationItem>
                    {prev_page_url ? (
                        <Link preserveScroll href={prev_page_url}>
                            <PaginationPrevious />
                        </Link>
                    ) : (
                        <PaginationPrevious aria-disabled className="opacity-50 pointer-events-none" />
                    )}
                </PaginationItem>

                {/* Page numbers */}
                {getVisiblePages().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <Link preserveScroll href={`?page=${page}`}>
                                <PaginationLink isActive={page === current_page}>{page}</PaginationLink>
                            </Link>
                        )}
                    </PaginationItem>
                ))}

                {/* Next button */}
                <PaginationItem>
                    {next_page_url ? (
                        <Link preserveScroll href={next_page_url}>
                            <PaginationNext />
                        </Link>
                    ) : (
                        <PaginationNext aria-disabled className="opacity-50 pointer-events-none" />
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationComponent;
