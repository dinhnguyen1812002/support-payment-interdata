import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { uppercaseText } from "@/Utils/slugUtils";
import axios from "axios";



interface Props {
    selectedCategory?: string | null | undefined;
    className?: string;
    onCategorySelect?: () => void;
}
interface Tag {
    id: number;
    name: string;
    slug: string;
}

const CategoriesSidebar: React.FC<Props> = ({
                                                selectedCategory,
                                                className = "",
                                                onCategorySelect,
                                            }) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const ITEMS_PER_PAGE = 5;
    const { url } = usePage();

    // Fetch categories từ API với pagination
    const fetchTags = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/tags?page=${pageNum}&per_page=${ITEMS_PER_PAGE}`);

            if (pageNum === 1) {
                setTags(res.data.data);
            } else {
                setTags(prev => [...prev, ...res.data.data]);
            }

            // Check if we've reached the end of the data
            setHasMore(res.data.data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load more categorie

    // Fetch total posts
    // useEffect(() => {
    //     const fetchTotalPosts = async () => {
    //         try {
    //             const res = await axios.get("/api/count");
    //             setTotalPosts(res.data);
    //         } catch (error) {
    //             console.error("Error fetching total post count:", error);
    //         }
    //     };
    //
    //     fetchTotalPosts();
    // }, []);

    // Initial categories load
    useEffect(() => {
        fetchTags(1);
    }, []);

    return (
        <div className={`mt-5 `}>
            {/* Header */}
            <div className="px-4 sm:px-5">
                <p className="w-full text-[0.8rem] font-bold text-mutedText dark:text-[#636674]">{uppercaseText('tags')}</p>
            </div>

            {/* Categories List */}
            <div className="p-1 mt-2">
                <div className="space-y-1">
                    <ScrollArea className="overflow-y-auto">
                        {tags.map((tag) => {
                            const isActive = url.startsWith(`/tags/${tag.slug}/posts`);
                            return (
                                <Button
                                    key={tag.id}
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
                                        href={`/tags/${tag.slug}/posts`}
                                        className="flex justify-between items-center w-full text-gray-600
                                         dark:text-[#9a9cae] hover:text-gray-900 dark:hover:text-blue-600 py-1 sm:py-2"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <span
                                                className={`font-bold text-sm ${
                                                    isActive ? "text-blue-600 dark:text-blue-400 dark:hover:text-blue-600" : ""
                                                }`}
                                            >
                                                {tag.name}
                                            </span>
                                        </div>
                                    </Link>
                                </Button>
                            );
                        })}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default CategoriesSidebar;
