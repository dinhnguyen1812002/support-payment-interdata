import  React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"

export default function SearchInput({
                                        placeholder = "Search...",
                                        onSearch,
                                    }: {
    placeholder?: string
    onSearch?: (value: string) => void
}) {
    const [searchValue, setSearchValue] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSearch) {
            onSearch(searchValue)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <Input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pr-10"
            />
            <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
            </Button>
        </form>
    )
}

