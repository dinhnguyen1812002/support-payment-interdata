import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
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

const CategoryList: React.FC<{ title: string; categories: Category[] }> = ({ title, categories }) => (
    <div className="mt-5">
        <div className="px-4 sm:px-5">
            <p className="w-full text-xs font-bold text-mutedText dark:text-[#636674]">
                {uppercaseText(title)}
            </p>
        </div>
        <div className="p-0 mt-2">
            <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant="ghost"
                        className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 h-auto text-sm"
                        asChild
                    >
                        <Link
                            href={`/`}
                            className="flex justify-between items-center w-full text-sm
                             text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-blue-600 py-1 sm:py-2"
                        >
                            <div className="flex gap-2 items-center text-sm dark:text-[] ">
                                <span className="text-[13.975px] font-semibold dark:text-[#9a9cae] hover:text-blue-600">{category.title}</span>
                            </div>
                            <span className="text-sm sm:text-sm text-mutedText dark:text-gray-400">
                                {category.number ?? 0}
                            </span>
                        </Link>
                    </Button>
                ))}
            </ScrollArea>
        </div>
    </div>
);

const Sidebar: React.FC<Props> = () => {
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [publicCategories, setPublicCategories] = useState<Category[]>([
        { id: 1, title: "All Question", number: 0 },
        { id: 2, title: "Search", number: null },
        { id: 3, title: "Tag", number: null },
        { id: 4, title: "Ask Question", number: null }
    ]);
    
    const listActivity = [
        { id: 1, title: "My Question", number: 24 },              
        { id: 2, title: "Resolve", number: 24 },
        { id: 3, title: "Enrolled", number: 24 },
        { id: 4, title: "Save", number: 24 }
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
            <CategoryList title="My Activity" categories={listActivity} />
            <CategoriesSidebar />
        </>
    );
};

export default Sidebar;