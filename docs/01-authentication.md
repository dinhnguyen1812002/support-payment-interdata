# 1. Xác thực và Quản lý Người dùng

Hệ thống sử dụng Laravel Fortify và Jetstream để cung cấp một hệ thống xác thực hoàn chỉnh và an toàn.

## Tính năng chính

-   **Đăng ký:** Người dùng mới có thể tạo tài khoản.
-   **Đăng nhập:** Hỗ trợ đăng nhập bằng email và mật khẩu.
-   **Xác thực hai yếu tố (2FA):** Tăng cường bảo mật cho tài khoản người dùng.
-   **Quản lý phiên đăng nhập:** Người dùng có thể xem và quản lý các phiên đăng nhập đang hoạt động.
-   **Cập nhật thông tin cá nhân:** Người dùng có thể thay đổi tên, email và mật khẩu.
-   **Quản lý Nhóm (Teams):**
    -   Người dùng có thể tạo và quản lý các nhóm (teams).
    -   Mời thành viên mới vào nhóm qua email.
    -   Phân quyền cho các thành viên trong nhóm (ví dụ: admin, editor).

## Tệp liên quan

-   `app/Actions/Fortify/`: Tùy chỉnh logic xác thực.
-   `app/Actions/Jetstream/`: Tùy chỉnh logic của Jetstream (ví dụ: xóa user).
-   `app/Models/User.php`: Model User.
-   `app/Models/Team.php`: Model Team.
-   `config/fortify.php`, `config/jetstream.php`: Các file cấu hình.
-   `routes/web.php`: Các route liên quan đến xác thực.
