# SPA Navigation - Không Load Lại Trang

Hệ thống đã được cập nhật để sử dụng **Inertia.js SPA navigation**, giúp chuyển trang mà không cần load lại toàn bộ trang.

## Tính năng

### 1. SPA Navigation
- Sử dụng Inertia.js Link component thay vì thẻ `<a>` thông thường
- Không reload trang khi navigate
- Giữ nguyên state của sidebar và các component khác
- Faster navigation experience

### 2. Navigation Progress Bar
- Hiển thị progress bar khi đang navigate
- Tự động ẩn khi hoàn thành
- Smooth animation

### 3. Loading States
- Hook để detect navigation state
- Loading indicators cho better UX
- Active route detection

## Cách sử dụng

### 1. Sử dụng Inertia Link thay vì thẻ `<a>`

```tsx
// ❌ Cách cũ - sẽ reload trang
<a href="/admin/posts">Posts</a>

// ✅ Cách mới - SPA navigation
import { Link } from '@inertiajs/react';
<Link href="/admin/posts">Posts</Link>
```

### 2. Sử dụng hook `useNavigation`

```tsx
import { useNavigation } from '@/Hooks/use-navigation';

function MyComponent() {
  const { isNavigating, currentUrl, navigate } = useNavigation();

  return (
    <div>
      <p>Current: {currentUrl}</p>
      <p>Status: {isNavigating ? 'Loading...' : 'Ready'}</p>
      <button onClick={() => navigate('/admin/posts')}>
        Go to Posts
      </button>
    </div>
  );
}
```

### 3. Sử dụng hook `useActiveRoute`

```tsx
import { useActiveRoute } from '@/Hooks/use-navigation';

function NavItem({ href, children }) {
  const { isActive } = useActiveRoute();
  const active = isActive(href);

  return (
    <Link 
      href={href} 
      className={active ? 'active' : ''}
    >
      {children}
    </Link>
  );
}
```

### 4. Thêm Navigation Progress Bar

```tsx
import { NavigationProgress } from '@/Components/ui/navigation-progress';

function Layout({ children }) {
  return (
    <div>
      <NavigationProgress />
      {children}
    </div>
  );
}
```

## Components đã cập nhật

### Sidebar Components
- `nav-main.tsx` - Menu chính
- `nav-projects.tsx` - Dashboard links  
- `nav-secondary.tsx` - Secondary navigation
- `app-sidebar.tsx` - Logo link

### Layout Components
- `Dashboard.tsx` - Admin dashboard
- `app-layout.tsx` - Department layout

### Navigation Components
- `advanced-ticket-table.tsx` - Ticket links (đã có sẵn)

## API Reference

### `useNavigation()`

**Returns:**
- `isNavigating` (boolean): Đang navigate hay không
- `currentUrl` (string): URL hiện tại
- `previousUrl` (string | null): URL trước đó
- `navigate(url, options?)` (function): Navigate programmatically
- `navigateReplace(url, options?)` (function): Navigate với replace

### `useNavigationWithLoading()`

**Returns:**
- Tất cả từ `useNavigation()`
- `isLoading` (boolean): Combined loading state
- `navigateWithLoading(url, options?)` (function): Navigate với loading state

### `useActiveRoute()`

**Returns:**
- `currentUrl` (string): URL hiện tại
- `isActive(path, exact?)` (function): Check if path is active
- `isActiveRoute(routes[], exact?)` (function): Check if any route is active

## Navigation Options

Khi sử dụng `navigate()` hoặc Inertia Link, có thể truyền options:

```tsx
// Preserve scroll position
navigate('/admin/posts', { preserveScroll: true });

// Preserve component state
navigate('/admin/posts', { preserveState: true });

// Replace history instead of push
navigate('/admin/posts', { replace: true });

// Custom data
navigate('/admin/posts', { 
  data: { filter: 'active' },
  method: 'get'
});
```

## Lợi ích

1. **Performance**: Không reload trang, chỉ update nội dung cần thiết
2. **UX**: Smooth transitions, không bị flash
3. **State Persistence**: Sidebar state, form data được giữ nguyên
4. **SEO Friendly**: URL vẫn thay đổi bình thường
5. **Browser History**: Back/Forward buttons hoạt động đúng

## Testing

1. Navigate giữa các trang trong admin dashboard
2. Kiểm tra sidebar state được giữ nguyên
3. Quan sát progress bar khi navigate
4. Test browser back/forward buttons
5. So sánh với regular links (sẽ reload trang)

Component `NavigationDemo` đã được tạo để demo và test các tính năng này.
