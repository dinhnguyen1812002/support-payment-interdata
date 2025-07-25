import Tags from '@/Pages/Posts/Tags';

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
  departments: Department[];
  roles: Role[];
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
  department: Department;
  roles: Role;
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
  id: number;
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
export interface Paginate {
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
  description: string;
  logo?: string;
  logo_url?: string;
  posts_count?: number;
  
}
export interface Tag {
  id: number;
  name: string;
  posts_count?: number;
}
export interface Comment {
  id: string;
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
  tags: Tag[];
  user: {
    id: number;
    name: string;
    profile_photo_url: string;
  };

  created_at: string;
  published_at: string;
  upvote_count: number;
  isUpvote: boolean;
  totalComment: number;
  has_upvoted: boolean;
  upvotes_count: number;
}
// interface Post {
//     id: string;
//     title: string;
//     content: string;
//     created_at: string;
//     user: {
//         name: string;
//         profile_photo_path: string;
//     };
//     categories: Category[];
//     tags: Tag[];
//     upvotes_count: number;
//     has_upvoted: boolean;
//     next_page_url: string | null;
//     comments: Comment[];
// }
// export interface Notification {
//
//     id: string;
//     data: {
//         message: string;
//         url?: string;
//     };
//     read_at: string | null;
// }
// export interface Notification {
//     id: string;
//     data: {
//         post_id?: number;
//         title?: string;
//         message: string;
//         slug?: string;
//         name?: string;
//         profile_photo_url?: string;
//         categories?: string[];
//         comment_id?: string;
//     };
//     read_at: string | null;
//     created_at: string;
// }\
export interface Notification {
  id: string;
  data: {
    post_id: string;
    title?: string;
    content: string;
    message: string;
    slug?: string;
    name?: string;
    profile_photo_url?: string;
    categories?: Category[];
    tags?: Tag[];
    product_id?: number;
    product_name?: string;
  };
  read_at: string | null;
  created_at: string;
  type: string;
  categories: Category[];
  tags: Tag[];
}
export interface IndexProps {
  posts: BlogPost[];
  categories: Category[];
  tags: Tag[];
  pagination: Paginate;
  postCount: number;
  keyword: string;
  selectedCategory?: string | null | undefined | unknown;
  notifications: Notification[];
  children: React.ReactNode;
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
  categories: Category[];
}
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
}

export interface Post {
  id: string;
  title: string;
  created_at: string;
  is_published: boolean;
  comments_count: number;
  slug: string;
  upvotes_count: number;
  deleted_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface PageLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PageLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}


export interface Ticket {
  id: string;
  title: string;
  content: string;
  category: Category[];
  priority: string;
  status: string;
  user: User;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
}

export interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  isStaff: boolean;
}

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   isStaff: boolean;
// }

// export interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: 'info' | 'success' | 'warning' | 'error';
//   read: boolean;
//   createdAt: Date;
//   ticketId?: string;
// }



export interface TicketFilters {
  category?: Category;
  priority?: string;
  status?: string
  search?: string;
  myTickets?: boolean;
  sortBy?: string;
}