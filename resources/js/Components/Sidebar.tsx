import React, { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { extractPublic, uppercaseText } from "@/Utils/slugUtils";
import axios from "axios";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";

interface Category {
    id: number;
    title: string;
    number?: number | null;
}

interface Props {
    selectedCategory?: string | null;
    className?: string;
    categories: Category[];
    onCategorySelect?: () => void;
}


interface Category {
    id: number;
    title: string;
    number?: number | null;
}

const getCategoryLink = (title: string, slug?: string) => {
    const routes: Record<string, string> = {
        "All Question": "/",
        "Ask Question": "/posts/create",
    };

    if (title === "Search") {
        return `/posts/search/${slug}`; // Chuyển hướng đến slug của bài viết
    }

    return routes[title] || `/${title.toLowerCase().replace(/\s+/g, "-")}`;
};

const CategoryList: React.FC<{ title: string; categories: Category[] }> = ({ title, categories }) => {
    const { url } = usePage();
    const [activeLink, setActiveLink] = useState(url); // Lưu trạng thái URL hiện tại

    useEffect(() => {
        setActiveLink(url); // Cập nhật trạng thái khi URL thay đổi
    }, [url]);

    const processedCategories = useMemo(() => {
        return categories.map((category) => {
            const link = getCategoryLink(category.title);
            const isActive = activeLink === "/" ? category.title === "All Question" : activeLink === link;
            return { ...category, link, isActive };
        });
    }, [categories, activeLink]);

    return (
        <div className="mt-5">
            <div className="px-4 sm:px-5">
                <p className="w-full text-xs font-bold text-mutedText dark:text-[#636674]">
                    {uppercaseText(title)}
                </p>
            </div>
            <div className="p-0 ">
                <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] space-y-3">
                    {processedCategories.map(({ id, title, number, link, isActive }) => (
                        <Button
                            key={id}
                            variant="ghost"
                            className={`w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 h-auto text-sm ${
                                isActive ? "border-l-4 bg-gray-100 dark:bg-gray-800 border-l-blue-600" : "border-l-2 border-transparent"
                            }`}
                            asChild
                        >
                            <Link
                                href={link}
                                className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-blue-600 py-1 sm:py-2"
                                onClick={() => setActiveLink(link)} // Cập nhật active khi click
                            >
                                <span className={`text-sm dark:text-[#9a9cae] hover:text-blue-600 font-bold ${
                                    isActive ? "dark:text-blue-400 text-base" : ""
                                }`}>
                                    {title}
                                </span>
                                <span className="text-sm sm:text-sm text-mutedText dark:text-gray-400">
                                    {number ?? null}
                                </span>
                            </Link>
                        </Button>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
};




const Sidebar: React.FC<Props> = () => {
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [publicCategories, setPublicCategories] = useState<Category[]>([
        { id: 1, title: "All Question", number: 0 },

        { id: 2, title: "search", number: null },
        { id:3, title: "Ask Question", number: null }
    ]);

    const listActivity = [
        { id: 1, title: "My Question", number: null },
        { id: 2, title: "Resolve", number: null },
        { id: 3, title: "Enrolled", number: null },
        { id: 4, title: "Save", number: null }
    ];

    // Fetch total posts and update the "All Question" category
    useEffect(() => {
        const fetchTotalPosts = async () => {
            try {
                const res = await axios.get("/api/count");
                const count = res.data;
                setTotalPosts(count);

                // Update the "All Question" category with the total post count
                setPublicCategories(prev =>
                    prev.map(category =>
                        category.title === "All Question"
                            ? { ...category, number: count }
                            : category
                    )
                );
            } catch (error) {
                console.error("Error fetching total post count:", error);
            }
        };

        fetchTotalPosts();
    }, []);

    return (
        <>
                <CategoryList title="Public" categories={publicCategories} />
                {/*<CategoryList title="My Activity" categories={listActivity} />*/}
                <CategoriesSidebar />

        </>
    );
};

export default Sidebar;
