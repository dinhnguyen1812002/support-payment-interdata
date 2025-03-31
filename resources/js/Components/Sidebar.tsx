

import  React from "react"
import { useEffect, useMemo, useState } from "react"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Button } from "@/Components/ui/button"
import { Link, usePage } from "@inertiajs/react"
import { uppercaseText } from "@/Utils/slugUtils"
import axios from "axios"
import CategoriesSidebar from "@/Pages/Categories/CategoriesSidebar"

import { SearchCommandDialog } from "@/Components/command-dialog"
import {Menu} from "lucide-react";

interface Category {
    id: number
    title: string
    number?: number | null
}

interface Props {
    selectedCategory?: string | null
    className?: string
    categories: Category[]
    onCategorySelect?: () => void
}

const getCategoryLink = (title: string, slug?: string) => {
    const routes: Record<string, string> = {
        "All Question": "/",
        "Ask Question": "/posts/create",
        "My Question" : ""
    }

    return routes[title] || `/${title.toLowerCase().replace(/\s+/g, "-")}`
}

interface CategoryListProps {
    title: string
    categories: Category[]
    setOpen?: (open: boolean) => void
}

export const CategoryList: React.FC<CategoryListProps> = ({ title, categories, setOpen }) => {
    const { url } = usePage()
    const [activeLink, setActiveLink] = useState(url)

    useEffect(() => {
        setActiveLink(url)
    }, [url])

    const processedCategories = useMemo(() => {
        const pathname = new URL(window.location.href).pathname

        return categories.map((category) => {
            const link = getCategoryLink(category.title)
            const isActive = pathname === "/" ? category.title === "All Question" : pathname === link
            return { ...category, link, isActive }
        })
    }, [categories, activeLink])
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const shortcutKey = isMac ? "⌘ + J" : "Ctrl + J"
    const handleCategoryClick = (title: string, link: string) => {
        if (title === "Search" && setOpen) {
            setOpen(true) // Mở SearchCommandDialog khi nhấn "Search"
        } else {
            setActiveLink(link) // Cập nhật activeLink cho các mục khác
        }
    }

    return (
        <div className="mt-5">
            <div className="px-4 sm:px-5">
                <p className="w-full text-[0.8rem] font-bold text-mutedText dark:text-[#636674]">{uppercaseText(title)}</p>
            </div>
            <div className="p-0">
                <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] space-y-3">
                    {processedCategories.map(({ id, title, number, link, isActive }) => (
                        <Button
                            key={id}
                            variant="ghost"
                            className={`w-full flex items-center justify-between rounded-l-lg px-4 py-2 text-sm transition mt-1
                                ${
                                isActive
                                    ? "border-l-4 border-blue-600 bg-gray-100 dark:bg-gray-800"
                                    : "border-l-2 border-transparent"
                            }
                                hover:bg-gray-100 dark:hover:bg-gray-800`}
                        >
                            {title === "Search" ? (
                                <div
                                    className="w-full flex items-center justify-between"
                                    onClick={() => handleCategoryClick(title, link)}
                                >
                                  <span
                                      className={`text-sm font-bold dark:text-[#9a9cae] hover:text-blue-400
                                                        ${isActive ? "dark:text-blue-400 text-base" : ""}`}
                                  >
                                    {title}
                                  </span>
                                    <span className="text-sm text-mutedText dark:text-gray-400">
                                        {title === "Search" ? shortcutKey : number ?? null}
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    href={link}
                                    className="w-full flex items-center justify-between"
                                    onClick={() => handleCategoryClick(title, link)}
                                >
                                  <span
                                      className={`text-sm font-bold dark:text-[#9a9cae] hover:text-blue-400
                                                    ${isActive ? "dark:text-blue-400 text-base" : ""}`}
                                  >
                                    {title}
                                  </span>
                                    <span className="text-sm text-mutedText dark:text-gray-400">{number ?? null}</span>
                                </Link>
                            )}
                        </Button>
                    ))}
                </ScrollArea>
            </div>
        </div>
    )
}

const Sidebar: React.FC<Props> = () => {
    const [open, setOpen] = useState(false)
    const [totalPosts, setTotalPosts] = useState<number>(0)
    const [publicCategories, setPublicCategories] = useState<Category[]>([
        { id: 1, title: "All Question", number: 0 },
        { id: 2, title: "Search", number: null },
        { id: 3, title: "Ask Question", number: null },
    ])

    const listActivity = [
        { id: 1, title: "My Question", number: null },
        { id: 2, title: "Resolve", number: null },
        { id: 3, title: "Enrolled", number: null },
        { id: 4, title: "Save", number: null },
    ]

    useEffect(() => {
        const fetchTotalPosts = async () => {
            try {
                const res = await axios.get("/api/count")
                const count = res.data
                setTotalPosts(count)
                setPublicCategories((prev) =>
                    prev.map((category) => (category.title === "All Question" ? { ...category, number: count } : category)),
                )
            } catch (error) {
                console.error("Error fetching total post count:", error)
            }
        }
        fetchTotalPosts()
    }, [])

    return (
        <>
            {/* Nút mở sidebar trên mobile */}

            <CategoryList title="Public" categories={publicCategories} setOpen={setOpen} />
            {/*<CategoryList title="My Activity" categories={listActivity} />*/}
            <CategoriesSidebar />
            <SearchCommandDialog open={open} setOpen={setOpen} />

        </>
    )
}

export default Sidebar

