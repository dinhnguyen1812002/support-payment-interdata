

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

interface Comment {
  id: number
  content: string
  created_at: string
  user: {
    id: number
    name: string
    email: string
    profile?: string
    profile_photo_path?: string
    roles?: string[]
    departments?: string[]
  }
  is_hr_response?: boolean
  parent_id?: number
  replies?: Comment[]
}

interface Ticket {
  id: number
  slug: string
  title: string
  content: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  profile?: string
  user: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
  }
  assignee?: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
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
  comments: Comment[]
}

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
function CommentItem({
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
  const replies = allComments.filter(c => c.parent_id === comment.id)
  const isReplying = replyingTo === comment.id

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyText.trim()) {
      onSubmitReply(comment.id, replyText.trim())

      setReplyText("")
      onCancelReply()
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
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

interface TicketResponseFormProps {
  ticket: Ticket
  onCommentAdded?: (comment: Comment) => void
  currentUser?: {
    id: number
    name: string
    email: string
    profile_photo_path?: string
  }
}

export function TicketResponseForm({ ticket, onCommentAdded, currentUser }: TicketResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState<Comment[]>(ticket.comments || [])
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const channelRef = useRef<any>(null)
  const isUnmountedRef = useRef(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    content: "",
    is_hr_response: false,
  })

  // Real-time comment updates
  useEffect(() => {
    if (!window.Echo || !ticket.id) return

    const channelName = `post.${ticket.id}`
    isUnmountedRef.current = false

    try {
      const channel = window.Echo.channel(channelName)
      channelRef.current = channel

      const handleCommentPosted = (e: { comment: Comment }) => {
        if (!isUnmountedRef.current && e.comment) {
          console.log('New comment received via real-time:', e.comment)

          // For any new comment/reply, reload the entire comments to maintain proper nested structure
          console.log('Reloading comments due to new comment/reply...')

          // Remove optimistic comments first
          setLocalComments(prev => prev.filter(c => !(c.id > 1000000000000)))

          // Reload comments from server to get proper nested structure
          fetch(`/admin/tickets/${ticket.slug}/comments`)
            .then(response => response.json())
            .then(data => {
              setLocalComments(data.ticket.comments || [])
            })
            .catch(error => {
              console.error('Failed to reload comments:', error)
            })

          // Call the parent callback if provided
          if (onCommentAdded) {
            onCommentAdded(e.comment)
          }
        }
      }

      // Listen for real-time comment events
      channel.listen('.CommentPosted', handleCommentPosted)

      console.log(`Listening for real-time comments on channel: ${channelName}`)

      return () => {
        isUnmountedRef.current = true
        if (channelRef.current) {
          try {
            channelRef.current.stopListening('.CommentPosted')
            window.Echo.leaveChannel(channelName)
          } catch (error) {
            console.warn('Error cleaning up Echo channel:', error)
          }
        }
        channelRef.current = null
      }
    } catch (error) {
      console.error('Error setting up real-time channel:', error)
    }
  }, [ticket.id, onCommentAdded])

  // Update local comments when ticket.comments changes
  useEffect(() => {
    setLocalComments(ticket.comments || [])
  }, [ticket.comments])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.content.trim()) {
      toast.error("Please enter a response message.")
      return
    }

    // Create optimistic comment for immediate UI update
    const optimisticComment: Comment = {
      id: Date.now(), // Temporary ID
      content: data.content,
      created_at: new Date().toISOString(),
      user: currentUser || {
        id: 0,
        name: 'You',
        email: '',
        profile_photo_path: undefined
      },
      is_hr_response: data.is_hr_response
    }

    // Add optimistic comment immediately
    setLocalComments(prev => [...prev, optimisticComment])

    setIsSubmitting(true)
    post(`/admin/tickets/${ticket.slug}/respond`, {
      onSuccess: () => {
       
        reset()

        // Keep optimistic comment until real-time event arrives
        // Set a fallback timeout to remove optimistic comment if real-time fails
        setTimeout(() => {
          setLocalComments(prev => prev.filter(c => c.id !== optimisticComment.id))
        }, 3000) // Remove after 3 seconds if no real-time event
      },
      onError: () => {
        toast.error("Failed to send response. Please try again.")
        // Remove optimistic comment on error
        setLocalComments(prev => prev.filter(c => c.id !== optimisticComment.id))
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  // Handle reply submission
  const handleReplySubmit = (parentId: number, content: string) => {
    // Create optimistic reply
    const optimisticReply: Comment = {
      id: Date.now(),
      content: content,
      created_at: new Date().toISOString(),
      user: currentUser || {
        id: 0,
        name: 'You',
        email: '',
        profile_photo_path: undefined
      },
      parent_id: parentId,
      is_hr_response: false
    }

    // Add optimistic reply immediately to the correct parent
    setLocalComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), optimisticReply]
        }
      }
      return comment
    }))

    // Submit reply to server
    fetch(`/admin/tickets/${ticket.slug}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        content: content,
        parent_id: parentId,
        is_hr_response: false
      })
    })
    .then(response => response.json())
    .then(() => {
      // Remove optimistic reply after successful submission
      setTimeout(() => {
        setLocalComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies?.filter(r => r.id !== optimisticReply.id) || []
        })))
      }, 3000)
    })
    .catch(() => {
      toast.error("Failed to send reply. Please try again.")
      // Remove optimistic reply on error
      setLocalComments(prev => prev.map(comment => ({
        ...comment,
        replies: comment.replies?.filter(r => r.id !== optimisticReply.id) || []
      })))
    })
  }

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-[#0a0a0a] min-h-screen">
      {/* Ticket Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">{ticket.title}</h1>
            <p className="text-gray-600 dark:text-white">
              Ticket #{ticket.id} • Created by {ticket.user.name}
            </p>
          </div>
          {/* <div className="flex gap-2">
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </Badge>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.replace("_", " ").charAt(0).toUpperCase() + ticket.status.replace("_", " ").slice(1)}
            </Badge>
          </div> */}
        </div>

        <div className="prose max-w-none mb-6">
          <div className="text-gray-700 dark:text-white leading-relaxed text-lg" 
          dangerouslySetInnerHTML={{ __html: ticket.content }} />
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-200">
          {/* <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{ticket.created_at}</span>
          </div> */}
          {ticket.assignee && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to {ticket.assignee.name}</span>
            </div>
          )}
          {ticket.department && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{ticket.department.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comments/Responses */}
      {localComments && localComments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Responses ({localComments.length})
          </h2>

          <div className="space-y-6">
            {localComments.filter(comment => !comment.parent_id).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onReply={(commentId) => setReplyingTo(commentId)}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onSubmitReply={handleReplySubmit}
                allComments={localComments}
              />
            ))}
          </div>

          <div className="border-b border-gray-200 mt-8 mb-8"></div>
        </div>
      )}

      {/* Response Form */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Send className="h-5 w-5" />
          Add Your Response
        </h2>
        <p className="text-gray-600 mb-6">
          Respond to this ticket. Your response will be visible to the ticket creator.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="content" className="text-base font-medium text-gray-700 mb-3 block">
              Response Message
            </Label>
            <Textarea
              id="content"
              placeholder="Type your response here..."
              value={data.content}
              onChange={(e) => setData("content", e.target.value)}
              rows={8}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
              disabled={processing || isSubmitting}
            />
            {errors.content && (
              <p className="text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.content}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_hr_response"
                checked={data.is_hr_response}
                onChange={(e) => setData("is_hr_response", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <Label htmlFor="is_hr_response" className="text-gray-700">
                Mark as HR Staff Response
              </Label>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={processing || isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                type="submit"
                disabled={processing || isSubmitting || !data.content.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                {processing || isSubmitting ? "Sending..." : "Send Response"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
