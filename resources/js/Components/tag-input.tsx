
import React from "react"
import { X } from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/Components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { cn } from "@/lib/utils"

interface Tag {
    id: number;  // Changed from string to number to match your backend
    name: string; // Changed from text to name to match your usage
}

interface SingleTagInputProps {
    options: Tag[]
    selectedTag: number | null
    setSelectedTag: (tag: number | null) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
}

export default function SingleTagInput({
    options,
    selectedTag,
    setSelectedTag,
    placeholder = "Select a tag...",
    emptyMessage = "No tags found.",
    className,
}: SingleTagInputProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const selectedOption = React.useMemo(() =>
        options.find((option) => option.id === selectedTag),
        [options, selectedTag]
    )

    const handleSelect = React.useCallback((value: string) => {
        setSelectedTag(Number(value))
        setOpen(false)
        setInputValue("")
    }, [setSelectedTag])

    const handleClear = React.useCallback(() => {
        setSelectedTag(null)
    }, [setSelectedTag])

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedTag ? (
                            <div className="flex items-center gap-2">
                                <span>{selectedOption?.name}</span>
                            </div>
                        ) : (
                            placeholder
                        )}
                        <div className="flex items-center gap-1">
                            {selectedTag && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleClear()
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Clear</span>
                                </Button>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                    <Command>
                        <CommandInput
                            className="border-none focus:ring-0"
                            placeholder="Search tags..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options
                                    .filter((option) =>
                                        option.name.toLowerCase().includes(inputValue.toLowerCase())
                                    )
                                    .map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.id.toString()}
                                            onSelect={handleSelect}
                                        >
                                            {option.name}
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
