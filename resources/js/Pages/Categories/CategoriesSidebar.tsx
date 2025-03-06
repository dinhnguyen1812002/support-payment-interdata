import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@inertiajs/react";
import {extractPublic, uppercaseText} from "@/Utils/slugUtils";
import { aw } from "framer-motion/dist/types.d-O7VGXDJe";
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
    categories: Category[];
    onCategorySelect?: () => void;
}


const CategoriesSidebar: React.FC<Props> = ({
                                                categories,
                                                selectedCategory,
                                                className = "",
                                                onCategorySelect,
                                            }) => {
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 5;
    // const visibleCategories = showAll ? categories : categories.slice(0, INITIAL_SHOW_COUNT);
    const visibleCategories = showAll ? categories.map(cat => ({ ...cat })) : categories.slice(0, INITIAL_SHOW_COUNT);
    const hasMoreCategories = categories.length > INITIAL_SHOW_COUNT;
    // let txt = "public";
    const inputStr = "cilpubxyzvpqrwy";
    const strResult = extractPublic([inputStr]);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    useEffect(()=>{
        const fetchTotalPosts = async()=>{
            try {
                const res = await axios.get("/api/count");
                setTotalPosts(res.data);
            } catch (error) {
                console.error("Error fetching total post count:", error);
            }
        };

        fetchTotalPosts();
    },[]
);



    return (
        <div className={`mt-5 ${className}`}>
        {/* Header */}
        <div className="px-4 sm:px-5">
          <p className="w-full text-sm font-bold text-mutedText dark:text-gray-300">
            {uppercaseText(strResult)}
          </p>
        </div>
      
        {/* Categories List */}
        <div className="p-0 mt-2">
          <div className="space-y-1">
            {/* "All" Button */}
            <Button
              variant="ghost"
              className={`w-full justify-between hover:bg-slate-100 dark:hover:bg-gray-800 px-4 py-2 h-auto relative text-sm
                ${!selectedCategory
                  ? "border-l-4 bg-slate-100 dark:bg-gray-800 border-l-blue-500 dark:border-l-blue-400"
                  : "border-l-2 border-l-transparent"
                }`}
              asChild
            >
              <Link
                href="/"
                className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 
                dark:hover:text-gray-100 py-1 sm:py-2"
              >
                <div className="flex gap-2 items-center">
                  <span className={`font-bold ${!selectedCategory ? "text-customBlue dark:text-mutedText font-bold" : ""}`}>
                    All Questions
                  </span>
                </div>
                <span className="text-base sm:text-sm text-gray-500 dark:text-gray-400">
                  {totalPosts}
                </span>
              </Link>
            </Button>
      
            {/* Categories List */}
            <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
              {visibleCategories.map((category) => {
                const isActive = selectedCategory === category.slug;
                return (
                    <Button
                    key={category.id}
                    variant="ghost"
                    className={`w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 h-auto relative text-sm
                        ${isActive
                            ? "border-l-4 border-blue-600 bg-gray-100 dark:bg-gray-800"
                            : ""
                        }`}
                    asChild
                    onClick={onCategorySelect}
                >
                    <Link
                        href={`/categories/${category.slug}/posts`}
                        className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-1 sm:py-2"
                    >
                        <div className="flex gap-2 items-center">
                            <span className={`font-normal ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
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
            {hasMoreCategories && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                  flex items-center justify-start gap-2 mt-2 px-4 py-2"
              >
                {showAll ? (
                  <>
                    Show Less <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
};

export default CategoriesSidebar;
