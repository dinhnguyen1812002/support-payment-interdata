# Tổng quan về Tính năng

## 1. Quản lý Bài viết (Posts)
- **Tạo và Quản lý Bài viết:** Người dùng có thể tạo, chỉnh sửa, xem và xóa bài viết.
- **Phân loại:** Mỗi bài viết có thể được gán vào một hoặc nhiều danh mục (categories) và gắn thẻ (tags).
- **Tìm kiếm & Lọc:** Hỗ trợ tìm kiếm toàn văn bản và lọc theo danh mục, thẻ, ngày tạo, v.v.
- **Phân trang:** Hiển thị danh sách bài viết theo trang với số lượng tùy chỉnh.

## 2. Quản lý Người dùng (Users)
- **Đăng ký & Đăng nhập:** Hỗ trợ đăng ký, đăng nhập bằng email/mật khẩu hoặc qua mạng xã hội (Google, Facebook, GitHub).
- **Hồ sơ người dùng:** Mỗi người dùng có thể cập nhật thông tin cá nhân và ảnh đại diện.
- **Quản lý người dùng:** Admin có thể quản lý tất cả người dùng, phân quyền và khóa/mở khóa tài khoản.

## 3. Quản lý Phòng ban (Departments)
- **Tạo và Quản lý Phòng ban:** Phân cấp phòng ban theo cây thư mục.
- **Thành viên:** Thêm/xóa người dùng vào các phòng ban.
- **Ủy quyền:** Có thể ủy quyền quản lý phòng ban cho người dùng khác.

## 4. Tự động hóa (Automation)
- **Quy tắc Tự động:** Tạo các quy tắc tự động để xử lý bài viết dựa trên các điều kiện nhất định.
- **Điều kiện & Hành động:** Mỗi quy tắc bao gồm các điều kiện (ví dụ: tiêu đề chứa từ khóa, thuộc phòng ban X) và các hành động (ví dụ: gán cho người dùng Y, đổi trạng thái, thêm thẻ).
- **Xử lý tự động:** `TicketAutomationService` sẽ thực thi các hành động khi điều kiện của quy tắc được thỏa mãn.

## 5. Thông báo (Notifications)
- **Web Notifications:** Hiển thị thông báo trực tiếp trên giao diện người dùng.
- **Email Notifications:** Gửi email thông báo cho các sự kiện quan trọng.
- **Real-time Updates:** Cập nhật thông báo theo thời gian thực sử dụng Laravel Reverb.
- **Các sự kiện được thông báo:**
  - Bài viết mới được tạo.
  - Bình luận mới.
  - Người dùng được thêm vào phòng ban.
  - Người dùng bị xóa khỏi phòng ban.
- **Tùy chỉnh:** Dễ dàng mở rộng với các loại thông báo mới.

## 6. Phân quyền (Permissions)
- **Phân quyền dựa trên vai trò (Role-Based Access Control - RBAC):** Sử dụng `spatie/laravel-permission` để quản lý vai trò (roles) và quyền hạn (permissions).
- **Policies:** Sử dụng các Policy của Laravel để kiểm soát quyền truy cập chi tiết trên từng model (ví dụ: ai có quyền sửa `Post`, ai có quyền xem `Department`).

## 7. Cấu trúc và Kỹ thuật
- **Backend:** Laravel 11.
- **Frontend:** Vite.js để biên dịch assets (CSS, JS).
- **Real-time:** Laravel Reverb cho giao tiếp WebSocket.
- **API:** Hỗ trợ API routes ([routes/api.php](cci:7://file:///f:/php/support-payment/routes/api.php:0:0-0:0)) với xác thực qua Laravel Sanctum.
- **Testing:** Cấu hình sẵn cho PHPUnit (Feature và Unit tests).
- **Deployment:** Hỗ trợ triển khai qua Docker và Nixpacks.