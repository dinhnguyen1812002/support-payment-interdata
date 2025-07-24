import React from 'react';
import { router } from '@inertiajs/react';
import TicketLayout from '@/Layouts/TicketLayout';
import { TicketCard } from './TicketCard';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';
import { Ticket } from '@/types/ticket';
import { ScrollArea } from '@/Components/ui/scroll-area';

interface TicketIndexProps {
  tickets: Ticket[];
  categories: any[];
  tags: any[];
  departments: any[];
  users: any[];
  ticketCount: number;
  myTicketsCount?: number;
  pagination: any;
  keyword: string;
  notifications: any[];
  sort: string;
  searchSuggestions?: string[];
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
  tags = [],
  departments = [],
  users = [],
  ticketCount,
  myTicketsCount = 0,
  pagination,
  keyword,
  notifications,
  sort,
  searchSuggestions = [],
  filters,
}) => {
  const title = 'Support Tickets';

  const handleTicketClick = (ticket: any) => {
    router.get(`/tickets/${ticket.slug}`);
  };

  return (
    <TicketLayout
      title={title}
      categories={categories}
      departments={departments}
      users={users}
      tags={tags}
      filters={filters}
      notifications={notifications}
      searchSuggestions={searchSuggestions}
      showTabs={true}
      showCreateButton={true}
    >
      <div className="p-6">
        <div className="container mx-auto">
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
                {tickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => handleTicketClick(ticket)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Results Summary */}
          {tickets.length > 0 && (
            <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
              <div className="flex space-x-2">
                Showing {pagination?.from || 1}-
                {pagination?.to || tickets.length} of {ticketCount} tickets
                {/* {pagination && pagination.last_page > 1 && (
                  <div>
                    Page {pagination.current_page} of {pagination.last_page}
                  </div>
                )} */}
              </div>

          {/* Pagination */}
            {pagination && pagination.total > 0 && (
              <div className="flex justify-end">
                <Pagination
                  current_page={pagination.current_page}
                  next_page_url={pagination.next_page_url}
                  prev_page_url={pagination.prev_page_url}
                  last_page={pagination.last_page}
                />
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </TicketLayout>
  );
};

export default TicketIndex;
