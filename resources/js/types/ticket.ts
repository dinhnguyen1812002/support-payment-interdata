import { CommentsResponse } from "./CommentTypes"

export interface Comment {
  id: number
  content: string
  created_at: string
  user: {
    id: number
    name: string
    email: string
    profile?: string
    profile_photo_path?: string
    profile_photo_url?: string
    roles?: string[]
    departments?: string[]
  }
  is_hr_response?: boolean
  parent_id?: number
  replies?: Comment[]
}

export interface Ticket {
  id: string
  slug: string
  title: string
  content: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
    profile_photo_url?: string
  }
  assignee?: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
    profile_photo_url?: string
  }
  department?: {
    id: number
    name: string
  }
  categories?: Array<{
    id: number
    title: string
  }>
  tags?: Array<{
    id: number
    name: string
  }>
  upvote_count?: number
  has_upvote?: boolean
  comments: CommentsResponse
  comments_count?: number
}