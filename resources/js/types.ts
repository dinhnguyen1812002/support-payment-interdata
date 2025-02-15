type DateTime = string;

export type Nullable<T> = T | null;

export interface Team {
  id: number;
  name: string;
  personal_team: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface User {
  id: number;
  name: string;
  email: string;
  current_team_id: Nullable<number>;
  profile_photo_path: Nullable<string>;
  profile_photo_url: string;
  two_factor_enabled: boolean;
  email_verified_at: Nullable<DateTime>;
  created_at: DateTime;
  updated_at: DateTime;
  notifications: Notification[];
}

export interface Auth {
  user: Nullable<
    User & {
      all_teams?: Team[];
      current_team?: Team;
    }
  >;
}

export type InertiaSharedProps<T = {}> = T & {
  jetstream: {
    canCreateTeams: boolean;
    canManageTwoFactorAuthentication: boolean;
    canUpdatePassword: boolean;
    canUpdateProfileInformation: boolean;
    flash: any;
    hasAccountDeletionFeatures: boolean;
    hasApiFeatures: boolean;
    hasTeamFeatures: boolean;
    hasTermsAndPrivacyPolicyFeature: boolean;
    managesProfilePhotos: boolean;
    hasEmailVerification: boolean;
  };
  auth: Auth;
  errorBags: any;
  errors: any;
};

export interface Session {
  id: number;
  ip_address: string;
  is_current_device: boolean;
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
  last_active: DateTime;
}

export interface ApiToken {
  id: number;
  name: string;
  abilities: string[];
  last_used_ago: Nullable<DateTime>;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface JetstreamTeamPermissions {
  canAddTeamMembers: boolean;
  canDeleteTeam: boolean;
  canRemoveTeamMembers: boolean;
  canUpdateTeam: boolean;
}

export interface Role {
  key: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  email: string;
  role: Nullable<string>;
  created_at: DateTime;
  updated_at: DateTime;
}
export interface Paginate{
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}



// export interface Category {
//     id: number;
//     title: string;
//     slug: string;
//     description?: string;
//     created_at: string;
//     updated_at: string;
//     posts_count: number;
// }
export interface Category {
    id: number;
    title: string;
    slug: string;
    posts_count?: number;
}
export interface Comment {
    id: number;
    comment: string;
    user: User;
    created_at: string;
    replies?: Comment[];
    parent_id?: number | null;
}
export interface NewCommentEvent {
    id: number;
    content: string;
    question_id: number;
    created_at: string;
    user: User;
}
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    slug: string;
    categories: Category[];
    user: {
        id: number;
        name: string;
        profile_photo_path: string;
    };

    created_at: string;
    published_at: string;
    upvote_count: number;
    isUpvote: boolean;

}
export interface Notification {

    id: string;
    data: {
        message: string;
        url?: string;
    };
    read_at: string | null;
}
export interface IndexProps {
    posts: BlogPost[];
    categories: Category[];
    pagination: Paginate;
    postCount: number;
    keyword: string;
    selectedCategory?: string | null | undefined | unknown;
    notifications: Notification[];
}
export interface EditPostProps {
    post: {
        id: number;
        title: string;
        content: string;
        slug: string;
        is_published: boolean;
        categories?: number[];
    };
    categories:Category[];

}
export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAllAsRead: () => void;
}
export interface Post {
    id: number;
    title: string;
    created_at: string;
    is_published: boolean;
    comments_count: number;
    slug: string;
    upvotes_count: number;
}
