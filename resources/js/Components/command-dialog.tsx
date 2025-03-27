import React, { useState } from "react"
import axios from "axios"

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"

interface SearchResult {
    id: string,
    title: string,
    excerpt: string,
    url: string,
    create_at: string,
}

interface SearchCommandDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function SearchCommandDialog({ open, setOpen }: SearchCommandDialogProps) {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Perform search
    const performSearch = async (query: string) => {
        if (!query) {
            setSearchResults([])
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.get('http://localhost:8000/api/global-search', {
                params: { query }
            })
            setSearchResults(response.data.results)
        } catch (error) {
            console.error("Search failed:", error)
            setSearchResults([])
        } finally {
            setIsLoading(false)
        }
    }

    // Strip HTML from excerpt
    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return doc.body.textContent || ''
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command shouldFilter={false}>
                <CommandInput
                    placeholder="Search documents..."
                    value={searchQuery}
                    onValueChange={(value) => {
                        setSearchQuery(value)
                        performSearch(value)
                    }}
                    className="border-none focus-visible:ring-0"
                />
                <CommandList>
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Searching...
                        </div>
                    ) : searchResults.length === 0 ? (
                        <CommandEmpty>No results found.</CommandEmpty>
                    ) : (
                        <CommandGroup heading={`Search Results (${searchResults.length})`}>
                            {searchResults.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.title}
                                    onSelect={() => window.location.href = item.url}
                                >
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{item.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(item.create_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {stripHtml(item.excerpt)}
                                        </p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    )
}

export default SearchCommandDialog
