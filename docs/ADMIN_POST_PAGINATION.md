# Admin Post Pagination - Tính năng phân trang nâng cao

## Tổng quan

Tính năng phân trang cho bảng post trong admin panel đã được cải thiện với các tính năng mới:

## Các tính năng chính

### 1. Tìm kiếm nâng cao (Server-side Search)
- Tìm kiếm theo tiêu đề bài viết
- Tìm kiếm theo nội dung bài viết  
- Tìm kiếm theo tên tác giả
- Sử dụng debounce để tối ưu hiệu suất (500ms delay)

### 2. Lọc theo trạng thái
- **All Status**: Hiển thị tất cả bài viết
- **Published**: Chỉ hiển thị bài viết đã xuất bản
- **Private**: Chỉ hiển thị bài viết riêng tư

### 3. Sắp xếp đa tiêu chí
- Sắp xếp theo tiêu đề (A-Z, Z-A)
- Sắp xếp theo ngày tạo (mới nhất, cũ nhất)
- Sắp xếp theo số lượng upvotes
- Sắp xếp theo số lượng comments

### 4. Phân trang thông minh
- Hiển thị số trang với logic thông minh (hiển thị 5 trang xung quanh trang hiện tại)
- Chọn số lượng items per page: 5, 10, 20, 50, 100
- Nút chuyển trang: First, Previous, Next, Last
- Hiển thị thông tin chi tiết: "Showing X to Y of Z posts"

### 5. URL Parameters
Tất cả các filter và pagination state được lưu trong URL parameters:
```
/admin/posts?search=laravel&status=published&sort=created_at&direction=desc&per_page=20&page=2
```

## Cấu trúc Code

### Backend (Laravel)

#### AdminService.php
```php
// Các method chính:
- getAllPosts(Request $request, int $perPage): array
- fetchPaginatedPosts(Request $request, int $perPage): LengthAwarePaginator
- getCurrentFilters(Request $request): array
- transformPosts(LengthAwarePaginator $posts): array
- formatPagination(LengthAwarePaginator $paginator): array
- generatePaginationLinks(LengthAwarePaginator $paginator): array
```

#### AdminController.php
```php
// Validation cho request parameters
- search: nullable|string|max:255
- status: nullable|in:all,published,private
- per_page: nullable|integer|min:5|max:100
- sort: nullable|in:title,created_at,updated_at,upvotes_count,comments_count
- direction: nullable|in:asc,desc
```

### Frontend (React + TypeScript)

#### DataTable Component
- Server-side search với debounce
- Real-time filtering
- URL state management
- Responsive design

#### Types
```typescript
interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{page: number; url: string; active: boolean}>;
}

interface Filters {
  search: string;
  status: string;
  sort: string;
  direction: string;
}
```

## Cách sử dụng

### 1. Tìm kiếm
- Nhập từ khóa vào ô search
- Hệ thống sẽ tự động tìm kiếm sau 500ms

### 2. Lọc theo trạng thái
- Chọn trạng thái từ dropdown "Status"
- Kết quả sẽ được cập nhật ngay lập tức

### 3. Sắp xếp
- Click vào menu "More Filters"
- Chọn tiêu chí sắp xếp
- Icon mũi tên hiển thị hướng sắp xếp hiện tại

### 4. Thay đổi số lượng items
- Chọn số lượng từ dropdown "Rows per page"
- Trang sẽ reset về trang 1

### 5. Chuyển trang
- Sử dụng các nút điều hướng
- Click vào số trang cụ thể
- Tất cả filters sẽ được giữ nguyên

## Performance Optimizations

1. **Debounced Search**: Giảm số lượng request khi người dùng gõ
2. **Query String Preservation**: Giữ nguyên state khi refresh trang
3. **Selective Re-rendering**: Chỉ update các component cần thiết
4. **Database Indexing**: Đảm bảo các cột được index để tìm kiếm nhanh

## Testing

Chạy test để kiểm tra tính năng:
```bash
php artisan test tests/Feature/AdminPostPaginationTest.php
```

## Troubleshooting

### Lỗi thường gặp:

1. **Search không hoạt động**: Kiểm tra debounce function
2. **Pagination không giữ filters**: Kiểm tra URL parameters
3. **Sort không hoạt động**: Kiểm tra allowed sort fields trong backend

### Debug:

1. Kiểm tra Network tab trong DevTools
2. Xem Laravel logs: `tail -f storage/logs/laravel.log`
3. Kiểm tra Inertia responses trong browser
