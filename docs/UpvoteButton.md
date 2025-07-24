# UpvoteButton Component

A reusable React component for handling upvote functionality on posts/tickets.

## Features

- ✅ **Optimistic Updates** - UI updates immediately for better UX
- ✅ **Error Handling** - Reverts changes if server request fails
- ✅ **Multiple Sizes** - Small, medium, and large variants
- ✅ **Multiple Variants** - Card and detail layouts
- ✅ **Loading States** - Disabled state during API calls
- ✅ **Accessibility** - Proper ARIA labels and keyboard support

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `postId` | `string` | - | **Required.** The ID of the post to upvote |
| `initialUpvoteCount` | `number` | - | **Required.** Initial number of upvotes |
| `initialHasUpvoted` | `boolean` | - | **Required.** Whether current user has upvoted |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the button |
| `variant` | `'card' \| 'detail'` | `'card'` | Layout variant |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the button is disabled |

## Usage Examples

### Basic Usage

```tsx
import { UpvoteButton } from '@/Components/UpvoteButton';

<UpvoteButton
  postId={ticket.id}
  initialUpvoteCount={ticket.upvote_count || 0}
  initialHasUpvoted={ticket.has_upvote || false}
/>
```

### Card Variant (for lists)

```tsx
<UpvoteButton
  postId={ticket.id}
  initialUpvoteCount={ticket.upvote_count || 0}
  initialHasUpvoted={ticket.has_upvote || false}
  size="sm"
  variant="card"
  className="min-w-[60px]"
/>
```

### Detail Variant (for detail pages)

```tsx
<UpvoteButton
  postId={ticket.id}
  initialUpvoteCount={ticket.upvote_count || 0}
  initialHasUpvoted={ticket.has_upvote || false}
  size="md"
  variant="detail"
  className="pt-1"
/>
```

### Different Sizes

```tsx
{/* Small - for compact layouts */}
<UpvoteButton size="sm" {...props} />

{/* Medium - default size */}
<UpvoteButton size="md" {...props} />

{/* Large - for emphasis */}
<UpvoteButton size="lg" {...props} />
```

## Variants

### Card Variant
- Compact layout suitable for lists
- Button and count in vertical stack
- Minimal spacing

### Detail Variant
- Expanded layout for detail pages
- Includes "vote/votes" label
- More spacing and emphasis

## Backend Requirements

The component expects:

1. **Route**: `posts.upvote` route that accepts POST requests
2. **Response**: Server should handle toggle logic (add/remove upvote)
3. **Data**: Posts should include `upvote_count` and `has_upvote` fields

### Example Backend Data

```php
// In your Post model's toFormattedArray() method
return [
    'id' => $this->id,
    'title' => $this->title,
    // ... other fields
    'upvote_count' => $this->upvotes_count ?? 0,
    'has_upvote' => auth()->check() ? $this->isUpvotedBy(auth()->id()) : false,
];
```

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Orange theme for upvoted state
- **Transitions**: Smooth color transitions
- **States**: Hover, active, and disabled states
- **Dark Mode**: Supports dark mode variants

## Accessibility

- Proper button semantics
- Keyboard navigation support
- Screen reader friendly
- Clear visual feedback

## Testing

Visit `/demo/upvote` to see the component in action with different configurations.

## Implementation Notes

1. **Optimistic Updates**: The UI updates immediately when clicked, then syncs with server
2. **Error Handling**: If server request fails, the UI reverts to previous state
3. **Debouncing**: Built-in protection against rapid clicking
4. **State Management**: Uses local state for immediate feedback

## Related Components

- `TicketCard` - Uses UpvoteButton in card variant
- `TicketDetail` - Uses UpvoteButton in detail variant
