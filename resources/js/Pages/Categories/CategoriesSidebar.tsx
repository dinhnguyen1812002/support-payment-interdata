import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { uppercaseText } from "@/Utils/slugUtils";
import axios from "axios";

interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}

interface Props {
    selectedCategory?: string | null | undefined;
    className?: string;
    onCategorySelect?: () => void;
}

const CategoriesSidebar: React.FC<Props> = ({
    selectedCategory,
    className = "",
    onCategorySelect,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const ITEMS_PER_PAGE = 5;
    const { url } = usePage();

    // Fetch categories từ API với pagination
    const fetchCategories = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/categories?page=${pageNum}&per_page=${ITEMS_PER_PAGE}`);

            if (pageNum === 1) {
                setCategories(res.data.data);
            } else {
                setCategories(prev => [...prev, ...res.data.data]);
            }

            // Check if we've reached the end of the data
            setHasMore(res.data.data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load more categories
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCategories(nextPage);
    };

    // Reset to first page
    const showLess = () => {
        setPage(1);
        fetchCategories(1);
    };

    // Fetch total posts
    useEffect(() => {
        const fetchTotalPosts = async () => {
            try {
                const res = await axios.get("/api/count");
                setTotalPosts(res.data);
            } catch (error) {
                console.error("Error fetching total post count:", error);
            }
        };

        fetchTotalPosts();
    }, []);

    // Initial categories load
    useEffect(() => {
        fetchCategories(1);
    }, []);

    return (
        <div className={`mt-5 ${className}`}>
            {/* Header */}
            <div className="px-4 sm:px-5">
                <p className="w-full text-sm font-bold text-mutedText dark:text-[#636674]">
                    {uppercaseText("categories")}
                </p>
            </div>

            {/* Categories List */}
            <div className="p-0 mt-2">
                <div className="space-y-1">
                    <ScrollArea className=" overflow-y-auto">

                        {categories.map((category) => {
                           const isActive = url.startsWith(`/categories/${category.slug}/posts`);
                            return (
                                <Button
                                    key={category.id}
                                    variant="ghost"
                                    className={`w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 h-auto relative text-sm
                                        ${isActive
                                            ? "border-l-4 border-blue-600 bg-gray-100 dark:bg-gray-800"
                                            : ""
                                        }`}
                                    asChild
                                    onClick={onCategorySelect}
                                >
                                    <Link
                                        href={`/categories/${category.slug}/posts`}
                                        className="flex justify-between items-center w-full text-gray-600
                                         dark:text-[#9a9cae] hover:text-gray-900 dark:hover:text-blue-600 py-1 sm:py-2"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <span
                                                className={`font-bold text-sm ${
                                                    isActive ? "text-blue-600 dark:text-blue-400 dark:hover:text-blue-600" : ""
                                                }`}
                                            >
                                                {category.title}
                                            </span>
                                        </div>
                                        <span className="text-xs sm:text-sm text-mutedText dark:text-gray-400">
                                            {category.posts_count ?? 0}
                                        </span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </ScrollArea>

                    {/* Show More/Less Button */}
                    <div className="flex justify-center">
                        {isLoading ? (
                            <Button
                                variant="ghost"
                                disabled
                                className="w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-start gap-2 mt-2 px-4 py-2"
                            >
                                Loading...
                            </Button>
                        ) : (
                            <>
                                {hasMore && (
                                    <Button
                                        variant="ghost"
                                        onClick={loadMore}
                                        className="w-full text-xs sm:text-xs text-mutedText dark:text-gray-400
                                        dark:hover:text-gray-100 flex items-center justify-start gap-2 mt-2 px-4 py-2"
                                    >
                                       More categories <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                )}
                                {page > 1 && (
                                    <Button
                                        variant="ghost"
                                        onClick={showLess}
                                        className="w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center justify-start gap-2 mt-2 px-4 py-2"
                                    >

                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesSidebar;
