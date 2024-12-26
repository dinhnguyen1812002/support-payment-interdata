import React from "react";
import {Link} from "@inertiajs/react";

interface Category {
    id: number;
    title: string;
    slug: string;
}

interface SidebarProps {
    categories: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({categories}) => {
    return (
        <div className="bg-white shadow p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <ul className="space-y-2">
                {categories.map((category) => (
                    <li key={category.id}>
                        <Link
                            href={`/categories/${category.slug}`}
                            className="text-blue-600 hover:underline"
                        >
                            {category.title}
                        </Link>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default Sidebar;
