

import  React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Label } from "@/Components/ui/label"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Send, User, Clock, MessageSquare, AlertCircle, X, Reply, CornerDownRight } from "lucide-react"
import { useForm } from "@inertiajs/react"
import { toast } from "sonner"
import { Comment } from "@/types/ticket"


interface CommentItemProps {
  comment: Comment
  currentUser?: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
  }
  onReply: (commentId: number) => void
  replyingTo: number | null
  onCancelReply: () => void
  onSubmitReply: (parentId: number, content: string) => void
  allComments: Comment[]
  depth?: number
}

// Component để hiển thị comment với reply
 export function CommentItem({
  comment,
  currentUser,
  onReply,
  replyingTo,
  onCancelReply,
  onSubmitReply,
  allComments,
  depth = 0
}: CommentItemProps) {
  const [replyText, setReplyText] = useState("")
  const isOptimistic = comment.id > 1000000000000
  const isCurrentUser = currentUser && comment.user.id === currentUser.id
  const replies = comment.replies || []
  const isReplying = replyingTo === comment.id

  // Debug log
  if (replies.length > 0) {
    console.log(`Comment ${comment.id} has ${replies.length} replies:`, replies)
  }

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyText.trim()) {
      onSubmitReply(comment.id, replyText.trim())

      setReplyText("")
      onCancelReply()
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8  pl-4' : ''}`}>
      <div className={`flex gap-4 ${isOptimistic ? 'opacity-70' : ''}`}>
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.user.profile_photo_path ? "/storage/" + comment.user.profile_photo_path : "/placeholder.svg"} />
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {comment.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.user.name}
              {isCurrentUser && !isOptimistic && (
                <span className="text-xs text-gray-500 ml-1">(You)</span>
              )}
            </span>
            {comment.is_hr_response && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">HR Staff</Badge>
            )}
            {depth > 0 && (
              <Badge variant="outline" className="text-xs">Reply</Badge>
            )}
            <span className="text-sm text-gray-500">
              {isOptimistic ? 'Sending...' : new Date(comment.created_at).toLocaleString()}
            </span>
            {isOptimistic && (
              <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
            )}
          </div>

          <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${isOptimistic ? 'border-l-4 border-blue-300' : ''}`}>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
          </div>

          {/* Reply button */}
          {!isOptimistic && depth < 3 && (
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="text-gray-500 hover:text-gray-700 p-0 h-auto"
              >
                <CornerDownRight className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <form onSubmit={handleSubmitReply} className="mt-4 space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!replyText.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onCancelReply}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              replyingTo={replyingTo}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              allComments={allComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

