

import  React from "react"
import { useState } from "react"
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Label } from "@/Components/ui/label"
import { Badge } from "@/Components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Send, User, Clock, MessageSquare, AlertCircle, X } from "lucide-react"
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
  }
  is_hr_response?: boolean
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

interface TicketResponseFormProps {
  ticket: Ticket
  onCommentAdded?: (comment: Comment) => void
}

export function TicketResponseForm({ ticket, onCommentAdded }: TicketResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    content: "",
    is_hr_response: false,
  })



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.content.trim()) {
      toast.error("Please enter a response message.")
      return
    }

    setIsSubmitting(true)
    post(`/admin/tickets/${ticket.slug}/respond`, {
      onSuccess: (response: any) => {
        toast.success("Your response has been sent successfully.")
        reset()
        if (onCommentAdded && response.props?.comment) {
          onCommentAdded(response.props.comment)
        }
      },
      onError: () => {
        toast.error("Failed to send response. Please try again.")
      },
      onFinish: () => {
        setIsSubmitting(false)
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#0a0a0a] min-h-screen">
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
      {ticket.comments && ticket.comments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Responses ({ticket.comments.length})
          </h2>

          <div className="space-y-8">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={ "/storage/"+ comment.user.profile_photo_path || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 ">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user.name}
                    </span>
                    {comment.is_hr_response && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">HR Staff</Badge>
                    )}
                    <span className="text-sm text-gray-500">{comment.created_at}</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
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
