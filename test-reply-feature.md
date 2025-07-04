# Test Reply Feature

## Tính năng đã thêm:

### 1. Backend Changes:
- ✅ **TicketResponseService**: Thêm hỗ trợ `parent_id` trong method `addResponse()`
- ✅ **TicketBulkController**: Thêm validation cho `parent_id` trong method `addResponse()`
- ✅ **Comments Model**: Đã có sẵn relationships `replies()` và `allReplies()`
- ✅ **Post Model**: Đã có sẵn method `getFormattedComments()` với nested structure

### 2. Frontend Changes:
- ✅ **Comment Interface**: Thêm `parent_id` và `replies` fields
- ✅ **CommentItem Component**: Tạo component mới để hiển thị comment với reply
- ✅ **Reply Logic**: Thêm state và logic xử lý reply
- ✅ **Nested Display**: Hiển thị replies với indentation và visual indicators
- ✅ **Reply Form**: Form inline để reply cho từng comment
- ✅ **Real-time Updates**: Hỗ trợ real-time cho cả comment và reply

### 3. Visual Improvements:
- 🎨 **Reply Indicator**: Badge "Reply" cho các reply
- 🎨 **Indentation**: Border-left và margin-left cho nested replies
- 🎨 **Reply Button**: Button với icon CornerDownRight
- 🎨 **Depth Limit**: Giới hạn 3 levels để tránh quá sâu
- 🎨 **HR Badge**: Phân biệt HR staff responses

### 4. Features:
- 📝 **Inline Reply**: Click "Reply" để mở form reply ngay dưới comment
- 🔄 **Real-time**: Reply được broadcast real-time
- 🎯 **Optimistic UI**: Reply hiển thị ngay lập tức, sau đó sync với server
- 📱 **Responsive**: Hoạt động tốt trên mobile

## Cách sử dụng:

1. **Để reply một comment**:
   - Click nút "Reply" dưới comment
   - Nhập nội dung reply
   - Click "Reply" hoặc "Cancel"

2. **Phân biệt comment và reply**:
   - Comment chính: Không có indentation
   - Reply: Có border-left và margin-left, badge "Reply"
   - HR responses: Badge "HR Staff" màu xanh

3. **Nested structure**:
   - Level 0: Comment chính
   - Level 1-3: Replies (tối đa 3 levels)
   - Sau level 3: Không cho phép reply thêm

## API Endpoints:

- `POST /admin/tickets/{ticket}/respond` - Thêm comment/reply
  - Parameters: `content`, `is_hr_response`, `parent_id` (optional)

## Database Structure:

```sql
comments table:
- id (ULID)
- user_id
- post_id  
- parent_id (nullable, references comments.id)
- comment (text)
- is_hr_response (boolean)
- created_at
- updated_at
```

## Testing:

1. Tạo ticket mới
2. Thêm comment chính
3. Reply comment đó
4. Reply cho reply (nested)
5. Kiểm tra real-time updates
6. Kiểm tra HR badge hiển thị đúng

## Fixes Applied:

### Problem: Replies mất khi reload page
**Root Cause**: Real-time updates không xử lý đúng cấu trúc nested, chỉ thêm comment/reply như item riêng biệt.

**Solution**:
1. **CommentPosted Event**: Cập nhật để load đầy đủ replies khi broadcast
2. **Frontend Logic**: Thay vì xử lý logic phức tạp, reload toàn bộ comments từ server khi có comment/reply mới
3. **Optimistic Updates**: Giảm timeout từ 5s xuống 3s để UX tốt hơn

### Changes Made:

#### Backend:
- ✅ **app/Events/CommentPosted.php**: Load `allReplies` và format đúng cấu trúc nested
- ✅ **Real-time Broadcasting**: Gửi đầy đủ thông tin replies

#### Frontend:
- ✅ **Real-time Handler**: Reload comments từ server thay vì xử lý logic phức tạp
- ✅ **Optimistic Updates**: Cải thiện timing và cleanup logic
- ✅ **Nested Structure**: Đảm bảo cấu trúc nested được duy trì sau reload

### Result:
- 🎯 **Persistent Replies**: Replies không bị mất khi reload page
- 🔄 **Real-time Sync**: Comments/replies sync real-time và duy trì cấu trúc
- 🎨 **Visual Consistency**: Nested display luôn đúng với database structure
