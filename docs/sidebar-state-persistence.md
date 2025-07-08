# Sidebar State Persistence

Hệ thống sidebar hiện tại đã được cải tiến để tự động lưu trữ và khôi phục trạng thái khi người dùng chuyển trang hoặc refresh browser.

## Tính năng

### 1. Lưu trữ trạng thái sidebar chính
- Trạng thái mở/đóng của sidebar được lưu trong localStorage
- Tự động khôi phục khi load lại trang
- Hoạt động trên cả desktop và mobile

### 2. Lưu trữ trạng thái các menu items
- Trạng thái mở/đóng của từng collapsible menu item
- Mỗi item có key riêng biệt để tránh xung đột
- Persistent across page navigation

### 3. Backward compatibility
- Vẫn hỗ trợ cookie-based state (legacy)
- Không ảnh hưởng đến code hiện tại

## Cách sử dụng

### 1. Sử dụng hook `useSidebarState`

```typescript
import { useSidebarState } from '@/Hooks/use-sidebar-state';

function MyComponent() {
  const {
    isOpen,
    isMobileOpen,
    setOpen,
    setMobileOpen,
    toggleSidebar,
    toggleMobileSidebar
  } = useSidebarState(true); // defaultOpen = true

  return (
    <div>
      <button onClick={toggleSidebar}>
        Toggle Sidebar
      </button>
      <p>Sidebar is {isOpen ? 'open' : 'closed'}</p>
    </div>
  );
}
```

### 2. Sử dụng hook `useSidebarItemState` cho menu items

```typescript
import { useSidebarItemState, createSidebarItemKey } from '@/Hooks/use-sidebar-state';

function NavItem({ title, defaultOpen = false }) {
  const itemKey = createSidebarItemKey(title);
  const [isOpen, setOpen] = useSidebarItemState(itemKey, defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      {/* Your collapsible content */}
    </Collapsible>
  );
}
```

### 3. Sử dụng hook `useSidebarItemsState` để quản lý tất cả items

```typescript
import { useSidebarItemsState } from '@/Hooks/use-sidebar-state';

function SidebarManager() {
  const { setItemState, getItemState, itemsState } = useSidebarItemsState();

  const resetAllItems = () => {
    Object.keys(itemsState).forEach(key => {
      setItemState(key, false);
    });
  };

  return (
    <button onClick={resetAllItems}>
      Close All Menu Items
    </button>
  );
}
```

## Cấu trúc dữ liệu trong localStorage

### Sidebar State
```json
{
  "isOpen": true
}
```
Key: `sidebar-state`

### Sidebar Items State
```json
{
  "ticket": true,
  "user": false,
  "automation": true,
  "dashboard": false
}
```
Key: `sidebar-items-state`

## API Reference

### `useSidebarState(defaultOpen?: boolean)`

**Parameters:**
- `defaultOpen` (boolean, optional): Trạng thái mặc định khi chưa có data trong localStorage

**Returns:**
- `isOpen` (boolean): Trạng thái hiện tại của sidebar
- `isMobileOpen` (boolean): Trạng thái mobile sidebar
- `setOpen` (function): Set trạng thái sidebar
- `setMobileOpen` (function): Set trạng thái mobile sidebar
- `toggleSidebar` (function): Toggle sidebar
- `toggleMobileSidebar` (function): Toggle mobile sidebar

### `useSidebarItemState(itemKey: string, defaultOpen?: boolean)`

**Parameters:**
- `itemKey` (string): Unique key cho menu item
- `defaultOpen` (boolean, optional): Trạng thái mặc định

**Returns:**
- `[isOpen, setOpen]`: Tuple với trạng thái và setter function

### `createSidebarItemKey(title: string)`

**Parameters:**
- `title` (string): Tên của menu item

**Returns:**
- `string`: Key đã được format (lowercase, replace spaces với dashes)

## Lưu ý

1. **Performance**: State chỉ được lưu khi có thay đổi, không impact performance
2. **Error Handling**: Tự động fallback về default state nếu localStorage bị lỗi
3. **Mobile**: Mobile sidebar state không được persist (theo design)
4. **Browser Support**: Hoạt động trên tất cả modern browsers hỗ trợ localStorage

## Testing

Để test tính năng này:

1. Mở dashboard admin
2. Thay đổi trạng thái sidebar và menu items
3. Refresh trang hoặc navigate đến trang khác
4. Kiểm tra xem state có được giữ nguyên không

Component `SidebarStateDemo` đã được thêm vào dashboard để demo và test tính năng này.
