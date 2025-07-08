# Category Logo Upload Feature

Tính năng upload logo cho categories đã được thêm vào hệ thống, cho phép admin upload và quản lý logo cho từng category.

## Tính năng

### 1. Upload Logo
- Upload logo khi tạo category mới
- Upload/thay đổi logo khi edit category
- Hỗ trợ các định dạng: JPEG, PNG, JPG, GIF, SVG
- Giới hạn kích thước: 2MB
- Drag & drop hoặc click để browse

### 2. Hiển thị Logo
- Logo hiển thị trong bảng danh sách categories
- Preview logo trong form edit/create
- Fallback icon khi không có logo

### 3. Quản lý Logo
- Xóa logo hiện tại
- Thay thế logo mới
- Tự động xóa logo khi xóa category

## Cấu trúc Database

### Migration
```php
Schema::table('categories', function (Blueprint $table) {
    $table->string('logo')->nullable()->after('description');
});
```

### Model Category
```php
protected $fillable = [
    'title', 'slug', 'description', 'logo',
];

public function getLogoUrlAttribute(): ?string
{
    return $this->logo ? asset('storage/' . $this->logo) : null;
}
```

## API Endpoints

### Upload Logo (Create/Update)
```
POST /admin/categories
PUT /admin/categories/{id}

Form Data:
- title: string (required)
- slug: string (required) 
- description: string (optional)
- logo: file (optional, max 2MB)
```

### Remove Logo
```
DELETE /admin/categories/{id}/remove-logo
```

## Frontend Components

### 1. ImageUpload Component
```tsx
<ImageUpload
  value={logoFile || category?.logo}
  onChange={handleLogoChange}
  onRemove={handleLogoRemove}
  accept="image/*"
  maxSize={2}
  placeholder="Upload category logo"
  disabled={processing}
/>
```

**Props:**
- `value`: File object hoặc URL string
- `onChange`: Callback khi file thay đổi
- `onRemove`: Callback khi xóa file
- `accept`: File types được chấp nhận
- `maxSize`: Kích thước tối đa (MB)
- `placeholder`: Text hiển thị
- `disabled`: Disable component

### 2. CategoryForm Component
```tsx
<CategoryForm 
  category={category} 
  mode="create" | "edit"
/>
```

**Features:**
- Auto-generate slug từ title
- Preview logo real-time
- Validation errors display
- Loading states

## Cách sử dụng

### 1. Tạo Category với Logo
1. Vào `/admin/categories`
2. Click "Add Category"
3. Nhập thông tin category
4. Upload logo bằng drag & drop hoặc click
5. Click "Create Category"

### 2. Edit Category Logo
1. Vào danh sách categories
2. Click edit button
3. Upload logo mới hoặc remove logo hiện tại
4. Click "Update Category"

### 3. Xóa Logo
- Trong form edit: Click "Remove" button
- Hoặc call API: `DELETE /admin/categories/{id}/remove-logo`

## File Storage

### Cấu trúc thư mục
```
storage/app/public/categories/logos/
├── category1-logo.jpg
├── category2-logo.png
└── ...
```

### URL Access
```
/storage/categories/logos/filename.jpg
```

## Validation Rules

### Backend (CategoryData)
```php
#[Rule('nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048')]
public ?UploadedFile $logo = null;
```

### Frontend
- File type: image/*
- Max size: 2MB
- Required: No (optional)

## Error Handling

### Upload Errors
- File too large: "File size must be less than 2MB"
- Invalid type: "Please select an image file"
- Upload failed: Server validation errors

### Display Errors
- Missing file: Fallback icon hiển thị
- Broken URL: Fallback icon hiển thị

## Security

### File Validation
- MIME type checking
- File extension validation
- Size limitation
- Storage trong public disk (safe)

### Access Control
- Chỉ admin có thể upload/edit
- CSRF protection
- Authentication required

## Performance

### Optimization
- Image resize/compress (có thể thêm sau)
- CDN integration (có thể thêm sau)
- Lazy loading trong table

### Storage
- Files stored trong `storage/app/public`
- Symlink tới `public/storage`
- Auto cleanup khi xóa category

## Testing

### Manual Testing
1. Upload các loại file khác nhau
2. Test file size limits
3. Test drag & drop functionality
4. Test remove logo
5. Test edit existing logo

### Automated Testing
```php
// Test upload logo
$response = $this->post('/admin/categories', [
    'title' => 'Test Category',
    'logo' => UploadedFile::fake()->image('logo.jpg', 100, 100)
]);

// Test remove logo
$response = $this->delete("/admin/categories/{$category->id}/remove-logo");
```

## Troubleshooting

### Common Issues
1. **File not uploading**: Check file size and type
2. **Logo not displaying**: Check storage symlink
3. **Permission errors**: Check storage permissions
4. **Validation errors**: Check CategoryData rules

### Storage Symlink
```bash
php artisan storage:link
```

### File Permissions
```bash
chmod -R 755 storage/
chmod -R 755 public/storage/
```
