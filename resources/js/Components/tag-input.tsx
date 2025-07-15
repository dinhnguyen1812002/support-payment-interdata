import React from 'react';
import { X, Check } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/Components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface Tag {
  id: number; // Changed from string to number to match your backend
  name: string; // Changed from text to name to match your usage
}

interface Category {
  id: number;
  title: string;
}

interface SingleTagInputProps {
  options: Tag[];
  selectedTag: number | null;
  setSelectedTag: (tag: number | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

interface MultiSelectInputProps {
  options: Category[];
  selectedItems: number[];
  setSelectedItems: (items: number[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  maxItems?: number;
}

export function SingleTagInput({
  options,
  selectedTag,
  setSelectedTag,
  placeholder = 'Select a tag...',
  emptyMessage = 'No tags found.',
  className,
}: SingleTagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedOption = React.useMemo(
    () => options.find(option => option.id === selectedTag),
    [options, selectedTag],
  );

  const handleSelect = React.useCallback(
    (value: string) => {
      setSelectedTag(Number(value));
      setOpen(false);
      setInputValue('');
    },
    [setSelectedTag],
  );

  const handleClear = React.useCallback(() => {
    setSelectedTag(null);
  }, [setSelectedTag]);

  return (
    <div className={cn('relative w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between dark:bg-[#0F1014]"
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
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
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
              className="border-none focus:ring-0 dark:bg-[#0F1014]"
              placeholder="Search tags..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options
                  .filter(option =>
                    option.name
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()),
                  )
                  .map(option => (
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
  );
}

export function MultiSelectInput({
  options,
  selectedItems,
  setSelectedItems,
  placeholder = 'Select categories...',
  emptyMessage = 'No categories found.',
  className,
  maxItems = 3,
}: MultiSelectInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedOptions = React.useMemo(
    () => options.filter(option => selectedItems.includes(option.id)),
    [options, selectedItems],
  );

  const handleSelect = React.useCallback(
    (value: string) => {
      const itemId = Number(value);
      if (selectedItems.includes(itemId)) {
        // Remove item if already selected
        setSelectedItems(selectedItems.filter(id => id !== itemId));
      } else if (selectedItems.length < maxItems) {
        // Add item if not selected and under limit
        setSelectedItems([...selectedItems, itemId]);
      }
      setInputValue('');
    },
    [selectedItems, setSelectedItems, maxItems],
  );

  const handleRemove = React.useCallback(
    (itemId: number) => {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    },
    [selectedItems, setSelectedItems],
  );

  const handleClear = React.useCallback(() => {
    setSelectedItems([]);
  }, [setSelectedItems]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => (
            <Badge
              key={option.id}
              variant="outline"
              className="px-3 py-1.5 text-sm flex items-center gap-1"
            >
              {option.title}
              <button
                type="button"
                onClick={() => handleRemove(option.id)}
                className="ml-1 hover:bg-primary-dark rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between dark:bg-[#0F1014] h-12"
            disabled={selectedItems.length >= maxItems}
          >
            {selectedItems.length > 0 ? (
              <span className="text-muted-foreground">
                {selectedItems.length} selected
              </span>
            ) : (
              placeholder
            )}
            <div className="flex items-center gap-1">
              {selectedItems.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear all</span>
                </Button>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              className="border-none focus:ring-0 dark:bg-[#0F1014]"
              placeholder="Search categories..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options
                  .filter(option =>
                    option.title
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()),
                  )
                  .map(option => (
                    <CommandItem
                      key={option.id}
                      value={option.id.toString()}
                      onSelect={handleSelect}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center justify-center w-4 h-4">
                          {selectedItems.includes(option.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span>{option.title}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SingleTagInput;
