# 2. Quản lý Bài đăng/Ticket
Đây là tính năng cốt lõi của hệ thống, cho phép người dùng tạo các yêu cầu hỗ trợ (ticket) hoặc các bài đăng.
## Luồng hoạt động

1.  **Tạo bài đăng:** Người dùng đã đăng nhập có thể tạo một bài đăng mới với tiêu đề, nội dung chi tiết.
2.  **Gán thuộc tính:** Khi tạo, người dùng có thể gán bài đăng vào một hoặc nhiều **Phân loại (Categories)**, đính kèm các **Thẻ (Tags)** liên quan, và chỉ định **Phòng ban (Department)** chịu trách nhiệm.
3.  **Trạng thái:** Mỗi bài đăng có một trạng thái (ví dụ: Mới, Đang xử lý, Đã đóng).
4.  **Quản trị:** Quản trị viên hoặc người dùng có quyền có thể xem, cập nhật trạng thái, và xóa bài đăng.

## Tính năng đặc biệt

-   **Force Delete:** Các bài đăng sau khi xóa mềm (soft delete) có thể được xóa vĩnh viễn thông qua một job (`ForceDeletePost`).
-   **Priorities:** Có thể thiết lập độ ưu tiên cho các ticket thông qua `PostTagPriority`.

## Tệp liên quan

-   `app/Http/Controllers/PostController.php`: (Cần được tạo hoặc kiểm tra lại) Controller xử lý logic cho bài đăng.
-   `app/Models/Post.php`: Model Post.
-   `app/Services/PostService.php`: Service class chứa business logic phức tạp.
-   `app/Policies/PostPolicy.php`: Định nghĩa quyền hạn (ai được làm gì) với bài đăng.
-   `database/migrations/...create_posts_table.php`: Cấu trúc bảng `posts` trong database.
