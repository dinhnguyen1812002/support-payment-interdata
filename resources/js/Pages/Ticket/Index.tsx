import React from 'react';
import { router } from '@inertiajs/react';
import TicketLayout from '@/Layouts/TicketLayout';
import { TicketCard } from './TicketCard';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import Pagination from '@/Components/Pagination';
import { Ticket } from '@/types/ticket';

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
  notifications,
  searchSuggestions = [],
  filters,
}) => {
  const title = 'Hỗ trợ khách hàng';

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
      showLable={true}
    >
      <div className="p-3 sm:p-6">
        <div className="container mx-auto">
          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="text-3xl sm:text-4xl mb-4">🎫</div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Không tìm thấy yêu cầu hỗ trợ
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                Không có yêu cầu hỗ trợ nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc tạo yêu cầu mới.
              </p>
              <Button
                onClick={() => router.get('/tickets/create')}
                className="w-full sm:w-auto"
              >
                Tạo yêu cầu hỗ trợ đầu tiên
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

          {/* Results Summary and Pagination */}
          {tickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-4 text-sm text-muted-foreground">
              <div className="order-2 sm:order-1">
                Hiển thị {pagination?.from || 1}-
                {pagination?.to || tickets.length} trong tổng số {ticketCount} yêu cầu
              </div>

              {/* Pagination */}
              {pagination && pagination.total > 0 && (
                <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center sm:justify-end">
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
