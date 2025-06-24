# Hệ thống Tự động Phân loại và Ưu tiên Ticket

## Tổng quan

Hệ thống tự động phân loại và ưu tiên ticket được thiết kế để:
- Tự động phân loại ticket theo danh mục (kỹ thuật, thanh toán, tư vấn, tổng quát)
- Gán mức độ ưu tiên (thấp, trung bình, cao, khẩn cấp) dựa trên nội dung
- Sử dụng quy tắc tự động để gán ticket cho đúng bộ phận hoặc nhân viên
- Quản lý các quy tắc thông qua admin dashboard

## Cấu trúc Database

### Bảng `posts` (đã cập nhật)
- `priority`: enum('low', 'medium', 'high', 'urgent') - Mức độ ưu tiên
- `category_type`: enum('technical', 'payment', 'consultation', 'general') - Loại danh mục
- `priority_score`: integer (0-100) - Điểm ưu tiên để sắp xếp
- `automation_applied`: json - Lịch sử các quy tắc đã áp dụng
- `auto_assigned_at`: timestamp - Thời gian tự động gán
- `auto_assigned_by_rule_id`: foreign key - ID quy tắc đã áp dụng

### Bảng `post_tag_priorities`
- `post_id`: foreign key - ID bài viết
- `tag_id`: foreign key - ID tag
- `priority`: enum - Mức độ ưu tiên cho cặp post-tag
- `priority_score`: integer - Điểm ưu tiên
- `automation_rules`: json - Quy tắc tự động cho cặp này

### Bảng `automation_rules`
- `name`: string - Tên quy tắc
- `description`: text - Mô tả quy tắc
- `is_active`: boolean - Trạng thái hoạt động
- `conditions`: json - Điều kiện kích hoạt (keywords, categories, tags)
- `actions`: json - Hành động thực hiện
- `category_type`: enum - Loại danh mục được gán
- `assigned_priority`: enum - Mức độ ưu tiên được gán
- `assigned_department_id`: foreign key - Phòng ban được gán
- `assigned_user_id`: foreign key - Người được gán
- `execution_order`: integer - Thứ tự thực thi (số nhỏ = ưu tiên cao)
- `matched_count`: integer - Số lần quy tắc được áp dụng
- `last_matched_at`: timestamp - Lần cuối áp dụng

## Cách hoạt động

### 1. Khi tạo ticket mới
1. Hệ thống phân tích nội dung title và content
2. Tự động phân loại dựa trên từ khóa:
   - **Technical**: lỗi, bug, api, database, server, code
   - **Payment**: thanh toán, payment, billing, refund, invoice
   - **Consultation**: tư vấn, help, hướng dẫn, question
   - **General**: các trường hợp khác

3. Tự động gán mức độ ưu tiên:
   - **Urgent**: khẩn cấp, urgent, emergency, critical, down
   - **High**: quan trọng, important, production, live
   - **Low**: không gấp, enhancement, suggestion
   - **Medium**: mặc định

4. Áp dụng automation rules theo thứ tự execution_order
5. Tính toán priority_score và tạo post-tag priorities

### 2. Automation Rules
Mỗi rule có thể chứa:

**Conditions (Điều kiện kích hoạt):**
```json
{
  "title_keywords": ["lỗi", "bug", "error"],
  "content_keywords": ["api", "database", "server"],
  "category_ids": [1, 2, 3],
  "tag_ids": [5, 6, 7]
}
```

**Actions (Hành động thực hiện):**
```json
{
  "set_priority": "high",
  "set_category": "technical",
  "notify_department": true,
  "escalate": true
}
```

### 3. Priority Score Calculation
Priority score được tính dựa trên:
- Base priority level (low=25, medium=50, high=75, urgent=100)
- Tag priority bonus (trung bình từ post-tag priorities)
- Age bonus (ticket cũ hơn được ưu tiên cao hơn)
- Kết quả cuối: 0-100 scale

## Sử dụng Admin Dashboard

### Quản lý Automation Rules
1. Truy cập `/admin/automation-rules`
2. Xem danh sách rules và thống kê
3. Tạo rule mới với `/admin/automation-rules/create`
4. Chỉnh sửa/xóa rules hiện có
5. Bật/tắt rules theo nhu cầu

### Tạo Rule mới
1. **Basic Information**: Tên, mô tả, thứ tự thực thi
2. **Trigger Conditions**: Keywords trong title/content, categories, tags
3. **Actions**: Category type, priority level, department/user assignment

### Thống kê Automation
Dashboard hiển thị:
- Tổng số rules (active/total)
- Số lần áp dụng rules (total/recent)
- Top performing rules
- Efficiency metrics

## API và Commands

### Artisan Commands
```bash
# Test automation system
php artisan automation:test

# Create sample posts for testing
php artisan automation:test --create-sample

# Bulk update priority scores
php artisan automation:bulk-update-scores
```

### Service Classes
- `TicketAutomationService`: Logic chính cho automation
- `PostService`: Tích hợp automation vào workflow tạo post
- `AutomationRuleController`: Quản lý rules trong admin

## Tùy chỉnh và Mở rộng

### Thêm Category Type mới
1. Cập nhật enum trong migration
2. Thêm vào `AutomationRule::CATEGORY_TYPES`
3. Thêm vào `Post::CATEGORY_TYPES`
4. Cập nhật logic trong `TicketAutomationService::categorizePost()`

### Thêm Priority Level mới
1. Cập nhật enum trong migration
2. Thêm vào `PostTagPriority::PRIORITY_SCORES`
3. Cập nhật các constants trong models

### Custom Automation Logic
Extend `TicketAutomationService` để thêm:
- Custom keyword matching algorithms
- Machine learning integration
- External API integration
- Advanced scoring algorithms

## Best Practices

1. **Rule Order**: Đặt rules quan trọng với execution_order thấp
2. **Keywords**: Sử dụng từ khóa tiếng Việt và tiếng Anh
3. **Testing**: Luôn test rules trước khi activate
4. **Monitoring**: Theo dõi matched_count để đánh giá hiệu quả
5. **Maintenance**: Định kỳ review và cập nhật rules

## Troubleshooting

### Rules không hoạt động
- Kiểm tra `is_active = true`
- Xem lại conditions có match với content không
- Kiểm tra execution_order
- Xem logs trong `automation_applied` field

### Priority Score không chính xác
- Chạy `php artisan automation:bulk-update-scores`
- Kiểm tra post-tag priorities
- Review priority calculation logic

### Performance Issues
- Index các trường thường query (priority_score, category_type)
- Optimize keyword matching algorithms
- Cache automation stats
- Batch process large datasets
