import React from 'react';
import { router } from '@inertiajs/react';
import TicketLayout from '@/Layouts/TicketLayout';
import { TicketCard } from './TicketCard';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

import Pagination from '@/Components/Pagination';
import { Ticket } from '@/types/ticket';

interface MyTicketsProps {
  tickets: Ticket[];
  categories: any[];
  departments: any[];
  users: any[];
  ticketCount: number;
  pagination: any;
  notifications: any[];
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

const MyTickets: React.FC<MyTicketsProps> = ({
  tickets = [],
  categories = [],
  departments = [],
  users = [],
  ticketCount,
  pagination,
  notifications,
  filters,
}) => {
  const title = 'My Tickets';

  const handleTicketClick = (ticket: any) => {
    router.get(`/tickets/${ticket.slug}`);
  };



  return (
    <TicketLayout
      title={title}
      categories={categories}
      departments={departments}
      users={users}
      filters={{ ...filters, myTickets: true }}
      notifications={notifications}
      showTabs={true}
      showCreateButton={true}
    >
      <div className="p-6">

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't created any tickets yet.
            </p>
            <Button onClick={() => router.get('/tickets/create')}>
              Create your first ticket
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          </Card>
        )}

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
    </TicketLayout>
  );
};

export default MyTickets;
