# 6. Hệ thống Thông báo

Hệ thống thông báo giữ cho người dùng luôn được cập nhật về các hoạt động quan trọng liên quan đến họ.

## Các loại thông báo

Hệ thống sử dụng hệ thống notification tích hợp của Laravel. Các thông báo có thể được gửi qua nhiều kênh (database, email, etc.).

-   **NewTicket:** Khi một ticket mới được tạo.
-   **NewPostNotification:** Khi có bài đăng mới.
-   **NewCommentNotification:** Khi có bình luận mới trong một bài đăng mà người dùng theo dõi.
-   **NewQuestionNotification:** Khi có câu hỏi mới.

## Cách hoạt động

1.  Một sự kiện được kích hoạt (ví dụ: `NewPostCreated`).
2.  Một listener bắt sự kiện đó và tạo một instance của notification (ví dụ: `PostCreatedNotification`).
3.  Notification được gửi đến những người dùng liên quan (ví dụ: tất cả admin hoặc người tạo bài đăng).
4.  Người dùng có thể xem thông báo trong giao diện người dùng hoặc nhận qua email.

## Tệp liên quan

-   `app/Notifications/`: Thư mục chứa tất cả các class notification.
-   `app/Listeners/`: Thư mục chứa các listener xử lý sự kiện.
-   `app/Events/`: Thư mục chứa các class event.
-   `app/Services/NotificationService.php`: Service quản lý logic thông báo.
-   `database/migrations/...create_notifications_table.php`: Bảng lưu trữ thông báo trong database.
