import { Category, Tag } from '@/types';
import { Comment } from '@/types/CommentTypes';
export interface Post {
  is_read: boolean | null;
  department_id: string;
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_published: boolean;
  user: {
    id: number;
    name: string;
    profile_photo_path: string;
  };
  categories: Category[];
  tags: Tag[];
  upvote_count: number;
  has_upvote: boolean;
  next_page_url: string | null;
  comments: Comment[];
  product_id?: number;
  product_name?: string;
}
export interface BlogPost {
  next_page_url: string | null;
  id: string;
  title: string;
  content: string;
  user: { name: string; profile_photo_path: string };
  categories: Category[];
  created_at: string;
  comments: Comment[];
  has_upvoted: boolean;
  upvotes_count: number;
  tags: Tag[];
}
