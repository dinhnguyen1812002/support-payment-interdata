# 4. Tổ chức (Phân loại, Thẻ, Phòng ban)

Để giữ cho hệ thống được tổ chức và dễ dàng quản lý, các bài đăng được phân loại bằng Categories, Tags, và Departments.

## Phân loại (Categories)

-   Cấu trúc phân cấp (cha-con) cho phép tổ chức các bài đăng theo chủ đề lớn.
-   Ví dụ: "Hỗ trợ kỹ thuật", "Thanh toán", "Góp ý sản phẩm".
-   Mỗi bài đăng có thể thuộc về nhiều phân loại.

## Thẻ (Tags)

-   Cung cấp một cách linh hoạt để gắn nhãn và lọc bài đăng.
-   Không có cấu trúc phân cấp, người dùng có thể thêm các thẻ tùy ý (nếu được cấp quyền).
-   Ví dụ: `bug`, `feature-request`, `urgent`.

## Phòng ban (Departments)

-   Gán các bài đăng/ticket cho một nhóm người dùng cụ thể (phòng ban) chịu trách nhiệm xử lý.
-   Người dùng có thể là thành viên của nhiều phòng ban.
-   Quyền truy cập vào các bài đăng có thể được giới hạn dựa trên phòng ban.

## Tệp liên quan

-   `app/Models/Category.php`, `app/Models/Tag.php`, `app/Models/Departments.php`
-   `app/Services/CategoryService.php`
-   `app/Policies/DepartmentPolicy.php`, `app/Policies/TagPolicy.php`
-   `database/migrations/...create_categories_table.php`, `...create_tags_table.php`, `...create_departments_table.php`
