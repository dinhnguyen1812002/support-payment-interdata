import {Category, Tag} from "@/types";
import { Comment } from "@/types/CommentTypes";
export interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user: {
        name: string;
        profile_photo_path: string;
    };
    categories: Category[];
    tags: Tag[];
    upvotes_count: number;
    has_upvoted: boolean;
    next_page_url: string | null;
    comments: Comment[];
}
