# Category Filtering System

A comprehensive category filtering system for tickets with multiple UI components and backend support.

## Features

- ✅ **Backend Filtering** - Server-side filtering by category in TicketService and PostService
- ✅ **Multiple UI Components** - Dropdown, quick filters, and display components
- ✅ **Frontend Filtering** - Client-side filtering in useTickets hook
- ✅ **Visual Feedback** - Category badges and displays in tickets
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Type Safety** - Full TypeScript support

## Components

### 1. CategoryFilter (Dropdown)

Main dropdown component for category selection.

```tsx
import { CategoryFilter } from '@/Components/CategoryFilter';

<CategoryFilter
  categories={categories}
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  showPostCount={true}
  size="md"
/>
```

**Props:**
- `categories` - Array of category objects
- `value` - Currently selected category ID (string)
- `onValueChange` - Callback when selection changes
- `showPostCount` - Show post count badges
- `size` - 'sm' | 'md' | 'lg'
- `placeholder` - Placeholder text
- `showAllOption` - Show "All Categories" option

### 2. CategoryQuickFilter (Buttons)

Quick filter buttons for rapid category selection.

```tsx
import { CategoryQuickFilter } from '@/Components/CategoryFilter';

<CategoryQuickFilter
  categories={categories}
  selectedCategory={selectedCategory}
  onCategoryChange={setSelectedCategory}
  showAll={true}
/>
```

### 3. CategoryDisplay (Visual)

Display component for showing categories in tickets.

```tsx
import { CategoryDisplay } from '@/Components/CategoryFilter';

<CategoryDisplay
  categories={ticket.categories}
  maxDisplay={2}
  size="sm"
/>
```

**Props:**
- `maxDisplay` - Maximum categories to show before "+X more"
- `size` - 'xs' | 'sm' | 'md'

## Backend Implementation

### TicketService

```php
// In getTicketsForIndex method
$category = $request->input('category', null);

if ($category) {
    $query->whereHas('categories', function ($q) use ($category) {
        // Support both slug and ID for backward compatibility
        if (is_numeric($category)) {
            $q->where('categories.id', $category);
        } else {
            $q->where('categories.slug', $category);
        }
    });
}
```

### PostService (MyTickets)

```php
// In getMyTickets method
$category = $request->input('category', null);

->when($category, function ($query, $category) {
    return $query->whereHas('categories', function ($q) use ($category) {
        $q->where('categories.id', $category);
    });
})
```

## Frontend Integration

### FilterSidebar

```tsx
<CategoryFilter
  categories={categories}
  value={filters.category}
  onValueChange={(value) => updateFilters({ category: value })}
  showPostCount={true}
/>
```

### useTickets Hook

```typescript
if (filters.category && ticket.categories) {
  const hasCategory = ticket.categories.some((cat: any) => 
    cat.id.toString() === filters.category
  );
  if (!hasCategory) {
    return false;
  }
}
```

## URL Parameters

The system supports URL-based filtering using category slugs:

```
/tickets?category=food&status=open&priority=high
/tickets?category=technical-support&sortBy=latest
```

**Note:** Both category slug and ID are supported for backward compatibility.

Parameters are automatically handled by:
- `FilterSidebar.updateFilters()`
- `useTickets.updateFilters()`
- Backend services

## Database Structure

### Categories Table
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    slug VARCHAR(255),
    description TEXT,
    logo VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Category-Post Relationship
```sql
CREATE TABLE category_post (
    id BIGINT PRIMARY KEY,
    category_id BIGINT,
    post_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
```

## Usage Examples

### Basic Filtering

```tsx
// In a ticket list component
const [selectedCategory, setSelectedCategory] = useState<string>();

<CategoryFilter
  categories={categories}
  value={selectedCategory}
  onValueChange={setSelectedCategory}
/>

// Filter tickets
const filteredTickets = tickets.filter(ticket => {
  if (!selectedCategory) return true;
  return ticket.categories?.some(cat => 
    cat.id.toString() === selectedCategory
  );
});
```

### Advanced Filtering with URL

```tsx
// Update URL when filter changes
const updateFilters = (newFilters: any) => {
  const searchParams = new URLSearchParams();
  const updatedFilters = { ...filters, ...newFilters };

  Object.entries(updatedFilters).forEach(([key, value]) => {
    if (value && value !== '') {
      searchParams.set(key, value.toString());
    }
  });

  router.get(`/tickets?${searchParams.toString()}`);
};
```

### Display in Ticket Cards

```tsx
// In TicketCard component
{ticket.categories && ticket.categories.length > 0 && (
  <CategoryDisplay
    categories={ticket.categories}
    maxDisplay={2}
    size="xs"
    className="mb-2"
  />
)}
```

## Styling

### Category Colors
- **Blue theme** for category badges
- **Hover effects** for interactive elements
- **Responsive sizing** for different screen sizes

### CSS Classes
```css
.category-badge {
  @apply bg-blue-50 text-blue-700 hover:bg-blue-100;
}

.category-filter-dropdown {
  @apply border rounded-md shadow-sm;
}
```

## Testing

Visit `/demo/category-filter` to test all components:
- Dropdown filters
- Quick filter buttons  
- Category displays
- Different sizes and configurations

## Performance Considerations

1. **Database Indexing**: Index `category_post.category_id` and `category_post.post_id`
2. **Eager Loading**: Use `->with(['categories'])` to avoid N+1 queries
3. **Caching**: Consider caching category lists
4. **Pagination**: Filter before pagination for accurate counts

## Related Files

- `app/Services/TicketService.php` - Backend filtering logic
- `app/Services/PostService.php` - MyTickets filtering
- `resources/js/Components/CategoryFilter.tsx` - UI components
- `resources/js/Pages/Ticket/FilterSidebar.tsx` - Filter interface
- `resources/js/Hooks/useTickets.ts` - Frontend filtering logic

## Migration Guide

If upgrading from a previous version:

1. Update backend services to include category filtering
2. Replace old category selects with new CategoryFilter component
3. Update type definitions to include category arrays
4. Test filtering functionality across all ticket views
