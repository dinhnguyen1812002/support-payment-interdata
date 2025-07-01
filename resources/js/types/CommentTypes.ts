
export interface User {
  id: number;
  name: string;
  profile_photo_path: string | null;
  roles?: string[];
  departments?: string[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: User;
  parent_id?: string;
  replies: Comment[];
  isOptimistic?: boolean; // Add this field
}

export interface CommentsResponse {
  data: Comment[];
  next_page_url: string | null;
}
