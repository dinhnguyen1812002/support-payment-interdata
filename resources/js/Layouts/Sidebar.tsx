import React from "react";
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar";
import LatestPosts from "@/Pages/Posts/LatestPost";

interface SidebarProps {
    categories: any[]; // Adjust the type accordingly
    selectedCategory?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory }) => {
    return (
        <div className="hidden lg:block w-64 mt-5">
            {/* Categories Sidebar */}
            <CategoriesSidebar
                
                selectedCategory={selectedCategory}
                className="w-full shrink-0"
            />

            {/* Latest Posts Section */}
            <div className="mt-5">
                <LatestPosts />
            </div>
        </div>
    );
};

export default Sidebar;
