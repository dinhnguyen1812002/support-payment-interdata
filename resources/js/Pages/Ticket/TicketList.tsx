import { useState } from "react";
import { TicketCard } from "./TicketCard";

import { Card } from "@/Components/ui/card";

import PaginationComponent from "@/Components/Pagination";

import React from "react";
import { Ticket } from "@/types/ticket";
import { useTickets } from "@/Hooks/useTickets";
import TicketDetail from "./TicketDetail";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { router } from "@inertiajs/react";

interface TicketListProps {
  tickets: Ticket[];
  filters?: any;
  allTicketsCount?: number;
  myTicketsCount?: number;
}

export function TicketList({
  tickets: initialTickets = [],
  filters: initialFilters = {},
  allTicketsCount = 0,
  myTicketsCount = 0
}: TicketListProps) {
  const { tickets, currentPage, totalPages, ticketsPerPage, totalTickets, filters } =
    useTickets(initialTickets, initialFilters);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  // If a ticket is selected, show the details page
  if (selectedTicket) {
    return (
      // <TicketDetailsTicketCard Debug - Ticket data: 
      //   ticket={selectedTicket}
      //   onBack={() => setSelectedTicket(null)}
      // />
      <TicketDetail ticket={selectedTicket} />
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🎫</div>
        <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          No tickets match your current filters. Try adjusting your search
          criteria or create a new ticket.
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ticketsPerPage + 1;
  const endIndex = Math.min(currentPage * ticketsPerPage, totalTickets);

  const handleTabChange = (value: string) => {
    if (value === 'my-tickets') {
      // Navigate to my tickets route
      router.get('/tickets/my');
    } else {
      // Navigate to all tickets route
      router.get('/tickets');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Support Tickets
          </h2>
          <p className="text-muted-foreground">
            {filters.myTickets
              ? "Manage and track your support tickets"
              : "Browse all support tickets and community discussions"}
          </p>
        </div>
        {/* <CreateTicketDialog /> */}
      </div>

      {/* Tabs for filtering */}
      <div className="flex items-center justify-between">
        <Tabs
          value={filters.myTickets ? 'my-tickets' : 'all-tickets'}
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="all-tickets">
              All Tickets ({filters.myTickets ? allTicketsCount : totalTickets})
            </TabsTrigger>
            <TabsTrigger value="my-tickets">
              My Tickets ({filters.myTickets ? totalTickets : myTicketsCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Tickets List */}
      <Card className="overflow-hidden">
        <div className="divide-y">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setSelectedTicket(ticket)}
            />
          ))}
        </div>
      </Card>
      {/* Results Summary */}
      <div className="flex items-right justify-between  space-y-1 space-x-1.5 text-sm text-muted-foreground">
        <div className="flex  space-x-2">
          Showing {startIndex}-{endIndex} of {totalTickets} tickets
          {totalPages > 1 && (
            <div className=" mr-1">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Pagination */}

        <PaginationComponent
          current_page={currentPage}
          last_page={totalPages}
          next_page_url={currentPage < totalPages ? `/tickets?page=${currentPage + 1}` : null}
          prev_page_url={currentPage > 1 ? `/tickets?page=${currentPage - 1}` : null}
        />
      </div>
    </div>
  );
}
