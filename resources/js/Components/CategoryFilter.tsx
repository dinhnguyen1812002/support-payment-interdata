import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Folder } from 'lucide-react';

interface Category {
  id: number;
  title: string;
  slug?: string;
  posts_count?: number;
  description?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  showAllOption?: boolean;
  showPostCount?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryFilter({
  categories = [],
  value = '',
  onValueChange,
  placeholder = 'Select category',
  showAllOption = true,
  showPostCount = false,
  className = '',
  size = 'md',
}: CategoryFilterProps) {
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onValueChange(undefined);
    } else {
      onValueChange(selectedValue);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 text-xs';
      case 'lg':
        return 'h-12 text-base';
      default:
        return 'h-10 text-sm';
    }
  };

  return (
    <Select value={value || 'all'} onValueChange={handleValueChange}>
      <SelectTrigger className={`${getSizeClasses()} ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span>All Categories</span>
            </div>
          </SelectItem>
        )}
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.slug || category.id.toString()}>
            <div className="flex items-center gap-2 w-full">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{category.title}</span>
              {showPostCount && category.posts_count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {category.posts_count}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
        {categories.length === 0 && (
          <SelectItem value="no-categories" disabled>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Folder className="h-4 w-4" />
              <span>No categories available</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

// Quick filter buttons variant
interface CategoryQuickFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  showAll?: boolean;
  className?: string;
}

export function CategoryQuickFilter({
  categories = [],
  selectedCategory,
  onCategoryChange,
  showAll = true,
  className = '',
}: CategoryQuickFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showAll && (
        <Badge
          variant={!selectedCategory ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80"
          onClick={() => onCategoryChange(undefined)}
        >
          <Folder className="h-3 w-3 mr-1" />
          All
        </Badge>
      )}
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === (category.slug || category.id.toString()) ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80"
          onClick={() => onCategoryChange(category.slug || category.id.toString())}
        >
          <Folder className="h-3 w-3 mr-1" />
          {category.title}
          {category.posts_count !== undefined && (
            <span className="ml-1 text-xs opacity-70">
              ({category.posts_count})
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
}

// Compact category display for cards
interface CategoryDisplayProps {
  categories: Category[];
  maxDisplay?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function CategoryDisplay({
  categories = [],
  maxDisplay = 2,
  size = 'sm',
  className = '',
}: CategoryDisplayProps) {
  const displayCategories = categories.slice(0, maxDisplay);
  const remainingCount = categories.length - maxDisplay;

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs px-1.5 py-0.5';
      case 'md':
        return 'text-sm px-2.5 py-1';
      default:
        return 'text-xs px-2 py-0.5';
    }
  };

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {displayCategories.map((category) => (
        <Badge
          key={category.id}
          variant="secondary"
          className={`${getSizeClasses()} `}
        >
          <Folder className="h-3 w-3 mr-1" />
          {category.title}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className={`${getSizeClasses()} text-muted-foreground`}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}

export default CategoryFilter;
