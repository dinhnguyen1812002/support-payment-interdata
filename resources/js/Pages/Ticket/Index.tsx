import React from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FilterSidebar } from './FilterSidebar';
import { TicketCard } from './TicketCard';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Search, Plus } from 'lucide-react';
import Pagination from '@/Components/Pagination';

interface TicketIndexProps {
  tickets: any[];
  categories: any[];
  tags: any[];
  departments: any[];
  users: any[];
  ticketCount: number;
  pagination: any;
  keyword: string;
  notifications: any[];
  sort: string;
  filters: {
    status?: string;
    priority?: string;
    department?: string;
    assignee?: string;
    category?: string;
    search?: string;
    myTickets?: boolean;
    sortBy?: string;
  };
}

const TicketIndex: React.FC<TicketIndexProps> = ({
  tickets = [],
  categories = [],
  departments = [],
  users = [],
  ticketCount,
  pagination,
  keyword,
  notifications,
  sort,
  filters,
}) => {
  const { props } = usePage();
  const title = 'Support Tickets';

  const handleTicketClick = (ticket: any) => {
    router.get(`/tickets/${ticket.slug}`);
  };

  const getPageTitle = () => {
    return `All Tickets (${ticketCount})`;
  };

  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <FilterSidebar
            categories={categories}
            departments={departments}
            users={users}
            filters={filters}
            currentUser={(props as any)?.auth?.user}
          />

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {getPageTitle()}
                  </h2>
                  <p className="text-muted-foreground">
                    Browse all support tickets and community discussions
                  </p>
                </div>
                <Button
                  onClick={() => router.get('/tickets/create')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Ticket
                </Button>
              </div>
              {/* Tickets List */}
              {tickets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">🎫</div>
                  <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No tickets match your current filters. Try adjusting your search
                    criteria or create a new ticket.
                  </p>
                  <Button onClick={() => router.get('/tickets/create')}>
                    Create your first ticket
                  </Button>
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <div className="divide-y">
                    {tickets.map((ticket) => {
                      // Adapt ticket data to match TicketCard props
                      const adaptedTicket = {
                        id: ticket.id,
                        title: ticket.title || 'Untitled',
                        description: ticket.content || '',
                        priority: ticket.priority || 'medium',
                        status: ticket.status ? ticket.status.replace('_', '-') : 'open',
                        tags: ticket.tags ? ticket.tags.map((tag: any) => tag.name) : [],
                        upvotes: ticket.upvote_count || 0,
                        upvotedBy: [], // This would need to be populated from backend
                        updatedAt: ticket.updated_at || ticket.created_at || '',
                        createdAt: ticket.created_at || '',
                        category: ticket.categories && ticket.categories.length > 0 ? ticket.categories[0].title : '',
                        author: {
                          name: ticket.user?.name || 'Unknown',
                          profile_photo_path: ticket.user?.profile_photo_path,
                          isStaff: ticket.user?.is_admin || false
                        },
                        replies: ticket.comments || [],
                        assignee: ticket.assignee ? {
                          name: ticket.assignee.name,
                          avatar: ticket.assignee.profile_photo_path
                        } : null
                      };

                      return (
                        <TicketCard
                          key={ticket.id}
                          ticket={adaptedTicket as any}
                          onClick={() => handleTicketClick(ticket)}
                        />
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Results Summary */}
              {tickets.length > 0 && (
                <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                  <div className="flex space-x-2">
                    Showing {pagination?.from || 1}-{pagination?.to || tickets.length} of {ticketCount} tickets
                    {pagination && pagination.last_page > 1 && (
                      <div>
                        Page {pagination.current_page} of {pagination.last_page}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total > 0 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current_page={pagination.current_page}
                    next_page_url={pagination.next_page_url}
                    prev_page_url={pagination.prev_page_url}
                    last_page={pagination.last_page}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default TicketIndex;