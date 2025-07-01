import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';
import { 
  Send, 
  Paperclip, 
  User, 
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile_photo_path?: string;
  };
  is_hr_response?: boolean;
}

interface Ticket {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile_photo_path?: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  department?: {
    id: number;
    name: string;
  };
  comments: Comment[];
}

interface TicketResponseFormProps {
  ticket: Ticket;
  onCommentAdded?: (comment: Comment) => void;
}

export function TicketResponseForm({ ticket, onCommentAdded }: TicketResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    content: '',
    is_hr_response: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.content.trim()) {
      // toast({
      //   title: "Error",
      //   description: "Please enter a response message.",
      //   variant: "destructive",
      // });
      toast.error("Please enter a response message.");
      return;
    }

    setIsSubmitting(true);

    post(`/admin/tickets/${ticket.slug}/respond`, {
      onSuccess: (response: any) => {
        // toast({
        //   title: "Success",
        //   description: "Your response has been sent successfully.",
        // });
        toast.success("Your response has been sent successfully.");
        reset();
        if (onCommentAdded && response.props?.comment) {
          onCommentAdded(response.props.comment);
        }
      },
      onError: (errors) => {
        // toast({
        //   title: "Error",
        //   description: "Failed to send response. Please try again.",
        //   variant: "destructive",
        // });
        toast.error("Failed to send response. Please try again.");
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
              <CardDescription>
                Ticket #{ticket.title} • Created by {ticket.user.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700"  
              dangerouslySetInnerHTML={{ __html: ticket.content }}
              ></p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {ticket.created_at}
              </div>
              {ticket.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Assigned to {ticket.assignee.name}
                </div>
              )}
              {ticket.department && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {ticket.department.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments/Responses */}
      {ticket.comments && ticket.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Responses ({ticket.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.comments.map((comment, index) => (
              <div key={comment.id}>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.profile_photo_path} />
                    <AvatarFallback>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      {comment.is_hr_response && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          HR Staff
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{comment.created_at}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
                {index < ticket.comments.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Response Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Add Response
          </CardTitle>
          <CardDescription>
            Respond to this ticket. Your response will be visible to the ticket creator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Response Message</Label>
              <Textarea
                id="content"
                placeholder="Type your response here..."
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                rows={6}
                className="resize-none"
                disabled={processing || isSubmitting}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_hr_response"
                  checked={data.is_hr_response}
                  onChange={(e) => setData('is_hr_response', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_hr_response" className="text-sm">
                  Mark as HR Staff Response
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={processing || isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={processing || isSubmitting || !data.content.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {processing || isSubmitting ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
