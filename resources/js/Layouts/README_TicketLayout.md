# TicketLayout Component

## Mô tả
TicketLayout là một layout component được tạo để tái sử dụng cấu trúc chung cho các trang ticket, bao gồm AppLayout, FilterSidebar và main content area.

## Props

```typescript
interface TicketLayoutProps {
  title: string;                    // Tiêu đề trang
  categories?: any[];               // Danh sách categories cho sidebar
  departments?: any[];              // Danh sách departments cho sidebar  
  users?: any[];                    // Danh sách users cho sidebar
  filters?: {                       // Filters hiện tại
    status?: string;
    priority?: string;
    department?: string;
    assignee?: string;
    category?: string;
    search?: string;
    myTickets?: boolean;
    sortBy?: string;
  };
  notifications?: any[];            // Notifications cho AppLayout
  children: React.ReactNode;        // Nội dung chính
  showSidebar?: boolean;           // Có hiển thị sidebar không (default: true)
  backUrl?: string;                // URL để back về trang trước
  backLabel?: string;              // Label cho back button (default: 'Back')
  showTabs?: boolean;              // Có hiển thị tabs All/My Tickets không (default: false)
  showCreateButton?: boolean;      // Có hiển thị nút Create Ticket không (default: false)
}
```

## Cách sử dụng

### 1. Trang với Sidebar và Tabs (Index, MyTickets, etc.)

```tsx
import TicketLayout from '@/Layouts/TicketLayout';

const TicketIndex = ({ tickets, categories, departments, users, filters, notifications }) => {
  return (
    <TicketLayout
      title="Support Tickets"
      categories={categories}
      departments={departments}
      users={users}
      filters={filters}
      notifications={notifications}
      showTabs={true}
      showCreateButton={true}
    >
      <div className="p-6">
        {/* Nội dung chính của trang */}
        {/* Ticket list, pagination, etc. */}
      </div>
    </TicketLayout>
  );
};
```

### 2. Trang không có Sidebar (Create, Edit, etc.)

```tsx
import TicketLayout from '@/Layouts/TicketLayout';

const CreateTicket = ({ notifications }) => {
  return (
    <TicketLayout
      title="Create New Ticket"
      notifications={notifications}
      showSidebar={false}
      backUrl="/tickets"
      backLabel="Back to Tickets"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Form tạo ticket */}
      </div>
    </TicketLayout>
  );
};
```

### 3. Trang Detail với Sidebar và Back Navigation

```tsx
import TicketLayout from '@/Layouts/TicketLayout';

const TicketDetail = ({ ticket, categories, departments, users, filters, notifications }) => {
  return (
    <TicketLayout
      title={`Ticket #${ticket.id} - ${ticket.title}`}
      categories={categories}
      departments={departments}
      users={users}
      filters={filters}
      notifications={notifications}
      backUrl="/tickets"
      backLabel="Back to tickets"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Ticket detail content */}
      </div>
    </TicketLayout>
  );
};
```

## Lợi ích

1. **Tái sử dụng code**: Không cần lặp lại cấu trúc AppLayout + FilterSidebar
2. **Consistency**: Đảm bảo tất cả ticket pages có cùng layout
3. **Maintainability**: Chỉ cần sửa một nơi khi thay đổi layout
4. **Flexibility**: Có thể tắt sidebar khi cần thiết

## Ví dụ các trang đã implement

- `Index.tsx` - Danh sách tất cả tickets (có sidebar)
- `MyTickets.tsx` - Tickets của user hiện tại (có sidebar)
- `CreateTicket.tsx` - Tạo ticket mới (không có sidebar, có back navigation)
- `TicketDetail.tsx` - Chi tiết ticket (không có sidebar, có back navigation)

## Migration từ trang cũ

**Trước:**
```tsx
return (
  <AppLayout title={title} notifications={notifications}>
    <div className="min-h-screen bg-background">
      <div className="flex">
        <FilterSidebar categories={categories} ... />
        <main className="flex-1 p-6">
          {/* content */}
        </main>
      </div>
    </div>
  </AppLayout>
);
```

**Sau:**
```tsx
return (
  <TicketLayout 
    title={title} 
    categories={categories}
    notifications={notifications}
    ...
  >
    <div className="p-6">
      {/* content */}
    </div>
  </TicketLayout>
);
```
