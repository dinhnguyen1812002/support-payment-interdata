import { Ability, AbilityBuilder, AbilityClass, MongoAbility, createMongoAbility } from '@casl/ability';
import { Permission, Role, User } from '../types/Role';

// Định nghĩa các hành động và đối tượng mà CASL sẽ kiểm tra
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subjects = 'Post' | 'User' | 'Tag' | 'Category' | 'Department' | 'Comment' | 'AutomationRule' | 'all';

// Define the subject types with their fields
type PostSubject = {
  id: string;
  user: {
    id: number;
  };
};

type CommentSubject = {
  id: string;
  user: {
    id: number;
  };
};

export type AppAbility = MongoAbility<[Actions, Subjects | PostSubject | CommentSubject]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

// Hàm tạo ability dựa trên user hiện tại
export function defineRulesFor(user: User | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // Người dùng chưa đăng nhập
    can('read', 'Post');
    return build();
  }

  // Check if user has roles and if they are a Department Manager
  const isDepartmentManager = user.roles?.some(role => role.name === 'Department Manager') ?? false;
  
  if (isDepartmentManager) {
    can('read', 'Department');
    can('update', 'Department');
    can('read', 'User');
    can('update', 'User');
  }

  // Add permissions based on user's permissions if they exist
  if (user.permissions && Array.isArray(user.permissions)) {
    user.permissions.forEach(permission => {
      if (permission?.name) {
        // Convert permission name to action and subject
        // Example: "create-post" -> ["create", "Post"]
        const parts = permission.name.split('-');
        if (parts.length === 2) {
          const action = parts[0] as Actions;
          // Convert subject to PascalCase
          const subject = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) as Subjects;
          can(action, subject);
        }
      }
    });
  }

  // Người dùng luôn có thể đọc bài viết
  can('read', 'Post');
  
  // Người dùng có thể cập nhật và xóa bài viết của chính họ
  can('update', 'Post', { 'user.id': user.id });
  can('delete', 'Post', { 'user.id': user.id });

  // Người dùng có thể xóa comment của chính họ
  can('delete', 'Comment', { 'user.id': user.id });

  return build();
}

// Tạo ability mặc định (sẽ được cập nhật khi user đăng nhập)
const defaultAbility = defineRulesFor(null);
export default defaultAbility;