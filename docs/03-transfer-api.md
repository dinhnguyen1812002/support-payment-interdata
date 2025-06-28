# 3. Transfer API

Tài liệu này mô tả cách sử dụng API để tạo ticket tự động từ các hệ thống bên ngoài.

## Tổng quan

API Transfer cho phép các hệ thống bên ngoài tạo ticket hỗ trợ một cách tự động thông qua gọi API. Mỗi yêu cầu cần được xác thực bằng API Key.

## Thông tin cơ bản

- **Endpoint:** `POST /api/transfer`
- **Phương thức:** POST
- **Content-Type:** `application/json`
- **Yêu cầu xác thực:** Có (X-API-KEY header)

## Yêu cầu

### Headers

| Tên header    | Bắt buộc | Mô tả                     |
|---------------|----------|---------------------------|
| X-API-KEY     | Có       | API Key để xác thực yêu cầu |
| Content-Type  | Có       | Phải là `application/json` |


### Body

```json
{
    "title": "Tiêu đề ticket",
    "content": "Nội dung chi tiết ticket",
    "user_id": 1,
    "tags": [1, 2, 3],
    "categories": [1, 2]
}
```

#### Tham số

| Tham số     | Bắt buộc | Kiểu dữ liệu | Mô tả                                      |
|-------------|----------|--------------|-------------------------------------------|
| title       | Có       | string       | Tiêu đề của ticket                        |
| content     | Có       | string       | Nội dung chi tiết của ticket              |
| user_id     | Có       | integer      | ID của người dùng tạo ticket              |
| tags        | Không    | array        | Mảng ID các thẻ (tags) liên quan          |
| categories  | Không    | array        | Mảng ID các phân loại (categories) liên quan |

## Phản hồi

### Thành công (200 OK)

```json
{
    "success": true,
    "post": {
        "id": 123,
        "title": "Tiêu đề ticket",
        "content": "Nội dung chi tiết ticket",
        "user_id": 1,
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

### Lỗi xác thực (401 Unauthorized)

```json
{
    "error": "Unauthorized"
}
```

### Lỗi xác thực dữ liệu (422 Unprocessable Entity)

```json
{
    "error": {
        "title": ["Trường tiêu đề là bắt buộc"],
        "user_id": ["Người dùng không tồn tại"]
    }
}
```

## Ví dụ sử dụng

### Sử dụng cURL

```bash
curl -X POST http://your-domain.com/api/transfer \
  -H "X-API-KEY: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lỗi thanh toán",
    "content": "Không thể thanh toán đơn hàng #12345",
    "user_id": 1,
    "tags": [1, 5],
    "categories": [2]
  }'
```

<!-- ### Sử dụng JavaScript (Fetch API)

```javascript
const response = await fetch('http://your-domain.com/api/transfer', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your-api-key-here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Lỗi thanh toán',
    content: 'Không thể thanh toán đơn hàng #12345',
    user_id: 1,
    tags: [1, 5],
    categories: [2]
  })
});

const data = await response.json();
console.log(data);
``` -->

## Lỗi thường gặp

| Mã lỗi | Mô tả | Nguyên nhân có thể |
|--------|-------|-------------------|
| 401    | Unauthorized | API Key không đúng hoặc không được cung cấp |
| 422    | Unprocessable Entity | Dữ liệu gửi lên không hợp lệ |
| 500    | Internal Server Error | Lỗi server nội bộ |

## Lưu ý

1. API Key cần được bảo mật và không chia sẻ công khai
2. Đảm bảo `user_id` tồn tại trong hệ thống trước khi gọi API
3. Các `tags` và `categories` phải tồn tại trong hệ thống
4. Giới hạn tốc độ (rate limiting) có thể được áp dụng tùy theo cấu hình hệ thống
