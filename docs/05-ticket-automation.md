# 5. Tự động hóa Ticket

Đây là một tính năng mạnh mẽ giúp tự động hóa các quy trình xử lý ticket, giảm thiểu công việc thủ công và tăng hiệu quả.

## Tổng quan

Hệ thống cho phép quản trị viên tạo ra các **Quy tắc Tự động hóa (Automation Rules)**. Mỗi quy tắc bao gồm một tập hợp các **Điều kiện (Conditions)** và một loạt các **Hành động (Actions)**.

Khi một sự kiện xảy ra (ví dụ: một ticket mới được tạo), hệ thống sẽ kiểm tra tất cả các quy tắc. Nếu các điều kiện của một quy tắc được đáp ứng, các hành động tương ứng sẽ được thực thi.

*(Nội dung này được tóm tắt từ file `TICKET_AUTOMATION_SYSTEM.md`)*

## Ví dụ

-   **Quy tắc:** Tự động gán ticket cho phòng ban IT.
    -   **Điều kiện:** Nếu tiêu đề ticket chứa từ "lỗi phần mềm" HOẶC thuộc phân loại "Hỗ trợ kỹ thuật".
    -   **Hành động:** Gán ticket cho phòng ban "IT Department" VÀ đặt độ ưu tiên là "Cao".

## Tệp liên quan

-   `app/Models/AutomationRule.php`: Model cho các quy tắc tự động hóa.
-   `app/Services/TicketAutomationService.php`: Service chứa logic để xử lý các quy tắc.
-   `database/factories/AutomationRuleFactory.php`: Factory để tạo dữ liệu mẫu.
