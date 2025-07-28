
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
  is_hr_response?: boolean; // Add HR response indicator
}

export interface CommentsResponse {
  data: Comment[];
  next_page_url: string | null;
  prev_page_url: string | null;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
