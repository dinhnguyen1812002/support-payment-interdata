import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

import { Button } from '@/Components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from '@inertiajs/react';
// import { Toast } from '@dnd-kit/utilities';
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

interface TicketDetailProps {
  ticket: Ticket;
}

export default function TicketDetail({ ticket: initialTicket }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCommentAdded = (newComment: Comment) => {
    setTicket(prevTicket => ({
      ...prevTicket,
      comments: [...prevTicket.comments, newComment]
    }));
  };

  const refreshTicket = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/admin/tickets/${ticket.slug}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
        toast.success
      } else {
        throw new Error('Failed to refresh');
      }
    } catch (error) {
      // toast({
      //   toas
      //   description: "Failed to refresh ticket. Please try again.",
      //   variant: "destructive",
      // });
      toast.error("Failed to refresh ticket. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppLayout
      title="Ticket Detail"
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
              Ticket Detail
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTicket}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )} canLogin={false} canRegister={false} notifications={[]}    >
      <Head title={`Ticket: ${ticket.title}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* <TicketResponseForm 
            ticket={ticket} 
            onCommentAdded={handleCommentAdded}
          /> */}
        </div>
      </div>
    </AppLayout>
  );
}
