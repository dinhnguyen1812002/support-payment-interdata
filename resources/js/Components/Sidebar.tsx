import React, { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { uppercaseText } from "@/Utils/slugUtils";
import axios from "axios";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import { SearchCommandDialog } from "@/Components/command-dialog";
import { Menu } from "lucide-react";
import TagBar from "@/Pages/Tags/TagBar";
import { Separator } from "@/Components/ui/separator"


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

const getCategoryLink = (title: string) => {
    const routes: Record<string, string> = {
        "All Questions": "/",
        "Ask Question": "/posts/create",
        "My Questions": "",
        "Search": "",
    };
    return routes[title] || `/${title.toLowerCase().replace(/\s+/g, "-")}`;
};

interface CategoryListProps {
    title: string;
    categories: Category[];
    setOpen?: (open: boolean) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ title, categories, setOpen }) => {
    const { url } = usePage();
    const [activeLink, setActiveLink] = useState(url);

    useEffect(() => {
        setActiveLink(url);
    }, [url]);

    const processedCategories = useMemo(() => {
        const pathname = new URL(window.location.href).pathname;
        return categories.map((category) => {
            const link = getCategoryLink(category.title);
            const isActive = pathname === "/" ? category.title === "All Questions" : pathname === link;
            return { ...category, link, isActive };
        });
    }, [categories, activeLink]);

    const handleCategoryClick = (title: string, link: string) => {
        if (title === "Search" && setOpen) {
            setOpen(true);
        } else {
            setActiveLink(link);
        }
    };
    const keyCmd = navigator.userAgent.indexOf('Mac OS X') ? "ctrl + k" : "⌘ + K";

    return (
        <div className="mt-5  ">
            <div className="px-4 sm:px-5">
                <p className="w-full text-[0.8rem] font-bold text-mutedText dark:text-[#636674]">{uppercaseText(title)}</p>
            </div>
            <div className="p-1">
                <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
                    {processedCategories.map(({ id, title, number, link, isActive }) => (
                        <div
                            key={id}
                            className={`flex items-center px-4 py-2  hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition mt-1 ${
                                isActive ? "border-l-4 border-blue-500 bg-gray-100 hover:text-blue-500  dark:bg-[#1B1C22]" : ""
                            }`}
                        >
                            {title === "Search" ? (
                                <div className="w-full flex items-center justify-between dark:text-[#9a9cae] "
                                     onClick={() => handleCategoryClick(title, link)}>

                                    <span
                                        className={`font-bold text-sm text-gray-600
                                         dark:text-[#9a9cae] hover:text-gray-900 dark:hover:text-blue-600 ${
                                            isActive ? "text-blue-600 dark:text-blue-400 dark:hover:text-blue-600" : ""
                                        }`}
                                    >
                                               {title}
                                            </span>
                                    <span className="text-gray-600
                                         dark:text-[#9a9cae] hover:text-gray-900 dark:hover:text-blue-600">{keyCmd}</span>
                                </div>
                            ) : (
                                <Link href={link} className="w-full flex h-5 items-center justify-between text-gray-600
                                         dark:text-[#9a9cae] hover:text-gray-900 dark:hover:text-blue-600" onClick={() => handleCategoryClick(title, link)}>
                                          <span className={`text-sm font-medium transition-colors   ${isActive ?
                                              " dark:text-blue-400 dark:hover:text-blue-600" : ""}`}>
                                        {title}

                                    </span >
                                    {number !== null && number !== undefined && (
                                        <span className="text-sm text-gray-400 ">{number.toLocaleString()}</span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
};

const Sidebar: React.FC<Props> = () => {
    const [open, setOpen] = useState(false);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [publicCategories, setPublicCategories] = useState<Category[]>([
        { id: 1, title: "All Questions", number: 6234 },
        { id: 2, title: "Search", number: null },
        // { id: 3, title: "Tags", number: null },
        { id: 4, title: "Ask Question", number: null }
    ]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        const fetchTotalPosts = async () => {
            try {
                const res = await axios.get("/api/count");
                const count = res.data;
                setTotalPosts(count);
                setPublicCategories((prev) =>
                    prev.map((category) => (category.title === "All Questions" ? { ...category, number: count } : category))
                );
            } catch (error) {
                console.error("Error fetching total post count:", error);
            }
        };
        fetchTotalPosts();
    }, []);

    return (
        <div className="w-56 p-2  ">
            <div className=" ml-2 ">
                <CategoryList title="PUBLIC" categories={publicCategories} setOpen={setOpen} />
                <TagBar />
                <CategoriesSidebar />
                <SearchCommandDialog open={open} setOpen={setOpen} />
            </div>
        </div>
    );
};

export default Sidebar;
