# 3. Tính năng Cộng đồng (Bình luận & Upvote)

Hệ thống cho phép tương tác giữa người dùng thông qua bình luận và upvote, giúp tăng tính cộng đồng và làm rõ các vấn đề.

## Bình luận

-   Người dùng có thể thêm bình luận vào các bài đăng/ticket.
-   Hỗ trợ bình luận trả lời (nested comments).
-   Khi một bình luận mới được đăng, hệ thống sẽ gửi thông báo (`NewCommentNotification`) đến những người liên quan.
-   Sự kiện `CommentPosted` được kích hoạt, cho phép các hành động tùy chỉnh khác.

## Upvote

-   Người dùng có thể upvote cho một bài đăng để thể hiện sự đồng tình hoặc cho thấy mức độ quan trọng của vấn đề.
-   Mỗi người dùng chỉ có thể upvote một lần cho mỗi bài đăng.
-   Số lượt upvote có thể được sử dụng để sắp xếp hoặc lọc các bài đăng.

## Tệp liên quan

-   `app/Models/Comments.php`: Model Comment.
-   `app/Models/PostUpvote.php`: Model lưu trữ lượt upvote.
-   `app/Events/CommentPosted.php`: Event khi có bình luận mới.
-   `app/Listeners/SendNewCommentNotification.php`: Listener gửi email thông báo.
-   `app/Notifications/NewCommentNotification.php`: Class định nghĩa nội dung thông báo.
