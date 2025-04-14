export interface User {
    id: number;
    name: string;
    profile_photo_path: string | null;
}

export interface Comment {
    id: string;
    user: User;
    comment: string;
    created_at: string;
    parent_id?: string
    replies?: Comment[];
}

export interface CommentsResponse {
    data: Comment[];
    next_page_url: string | null;
}
