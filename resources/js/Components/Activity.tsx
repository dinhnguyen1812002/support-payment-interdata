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

const Activity: React.FC<Props> = ({
                                
                                            }) => {
    const [showAll, setShowAll] = useState(false);
    const INITIAL_SHOW_COUNT = 5;
    // const visibleCategories = showAll ? categories : categories.slice(0, INITIAL_SHOW_COUNT);


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
const listActivity = [
    {
        "id":1,
        "title": "My Question",
        "number":  24
    },
    {
        "id":2,
        "title": "My Question",
        "number":  24
    },
    {
        "id":3,
        "title": "My Question",
        "number":  24
    },
    {
        "id":4,
        "title": "My Question",
        "number":  24
    }
]
    return (
        <div className={`mt-5 `}>
        {/* Header */}
        <div className="px-4 sm:px-5">
          <p className="w-full text-sm font-bold text-mutedText dark:text-gray-300">
            {uppercaseText('My Activity')}
           
          </p>
        </div>
      
        {/* Categories List */}
        <div className="p-0 mt-2">
          <div className="space-y-1">
            {/* "All" Button */}
        
            {/* Categories List */}
            <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
              {listActivity.map((category) => {
                
                return (
                    <Button
                    key={category.id}
                    variant="ghost"
                    className={`w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 h-auto relative text-sm
                       `}
                    asChild
                   
                >
                    <Link
                        href={`/`}
                        className="flex justify-between items-center w-full text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-1 sm:py-2"
                    >
                        <div className="flex gap-2 items-center">
                            <span className={`font-normal `}>
                                {category.title}
                            </span>
                        </div>
                        <span className="text-xs sm:text-sm text-mutedText dark:text-gray-400">
                            {category.number ?? 0}
                        </span>
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

export default Activity;
