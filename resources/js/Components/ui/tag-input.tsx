import * as React from "react"
import { X } from "lucide-react"

import { Badge } from "@/Components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/Components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

export type Tag = {
    id: string
    text: string
}

type TagInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    placeholder?: string
    tags: Tag[]
    setTags: React.Dispatch<React.SetStateAction<Tag[]>>
    suggestions?: Tag[]
    onTagAdd?: (tag: Tag) => void
    onTagRemove?: (tagId: string) => void
    disabled?: boolean
    className?: string
}

export function TagInput({
                             placeholder = "Add tag...",
                             tags,
                             setTags,
                             suggestions = [],
                             onTagAdd,
                             onTagRemove,
                             disabled = false,
                             className,
                             ...props
                         }: TagInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = React.useState("")
    const [open, setOpen] = React.useState(false)

    const handleAddTag = (tag: Tag) => {
        if (tag.text.trim() !== "" && !tags.some((t) => t.id === tag.id)) {
            const newTags = [...tags, tag]
            setTags(newTags)
            onTagAdd?.(tag)
        }
        setInputValue("")
        inputRef.current?.focus()
    }

    const handleRemoveTag = (tagId: string) => {
        const newTags = tags.filter((tag) => tag.id !== tagId)
        setTags(newTags)
        onTagRemove?.(tagId)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue) {
            e.preventDefault()
            handleAddTag({ id: crypto.randomUUID(), text: inputValue })
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            handleRemoveTag(tags[tags.length - 1].id)
        }
    }

    const filteredSuggestions = suggestions.filter(
        (suggestion) =>
            suggestion.text.toLowerCase().includes(inputValue.toLowerCase()) && !tags.some((tag) => tag.id === suggestion.id),
    )

    return (
        <div
            className={cn(
                "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
                disabled && "cursor-not-allowed opacity-50",
                className,
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.text}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveTag(tag.id)
                            }}
                            className="rounded-full outline-none ring-offset-background focus:ring-1 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag.text}</span>
                        </button>
                    )}
                </Badge>
            ))}
            <CommandPrimitive onKeyDown={(e) => e.stopPropagation()}>
                <div className="flex flex-1">
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value)
                            setOpen(true)
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        disabled={disabled}
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                        placeholder={tags.length === 0 ? placeholder : ""}
                        {...props}
                    />
                </div>
                <div className="relative">
                    {open && filteredSuggestions.length > 0 && (
                        <div className="absolute top-0 z-10 w-full min-w-[180px]">
                            <Command className="rounded-lg border shadow-md">
                                <CommandGroup>
                                    {filteredSuggestions.map((suggestion) => (
                                        <CommandItem
                                            key={suggestion.id}
                                            onSelect={() => {
                                                handleAddTag(suggestion)
                                                setOpen(false)
                                            }}
                                        >
                                            {suggestion.text}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </div>
                    )}
                </div>
            </CommandPrimitive>
        </div>
    )
}

