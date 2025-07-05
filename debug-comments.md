# Debug Comments Structure

## Vấn đề: Comments không hiển thị replies

### Các bước debug:

1. **Kiểm tra backend data structure**:
   - ✅ `Post::getFormattedComments()` method đúng
   - ✅ `formatComment()` method có map `allReplies`
   - ✅ Controller gọi đúng method

2. **Kiểm tra frontend**:
   - ✅ CommentItem component sử dụng `comment.replies`
   - ✅ Nested rendering logic đúng
   - ✅ Filter chỉ hiển thị main comments (`!comment.parent_id`)

3. **Debug logs đã thêm**:
   - Console log khi ticket.comments update
   - Console log khi comment có replies
   - Debug info hiển thị số lượng comments

### Cần kiểm tra:

1. **Mở browser console** và xem:
   - "Ticket comments updated:" - xem cấu trúc data
   - "Comment X has Y replies:" - xem replies có được load không

2. **Kiểm tra debug info** trên UI:
   - Total comments
   - Main comments  
   - Comments with replies

3. **Test case**:
   - Tạo 1 comment chính
   - Reply comment đó
   - Reload page
   - Xem console logs và debug info

### Expected structure:
```json
[
  {
    "id": "comment-1",
    "content": "Main comment",
    "parent_id": null,
    "replies": [
      {
        "id": "reply-1", 
        "content": "Reply to main",
        "parent_id": "comment-1",
        "replies": []
      }
    ]
  }
]
```

### Nếu vẫn không hiển thị:
- Kiểm tra CSS có ẩn replies không
- Kiểm tra conditional rendering
- Kiểm tra key props trong map
