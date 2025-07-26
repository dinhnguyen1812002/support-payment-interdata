import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FilterSidebar } from '@/Pages/Ticket/FilterSidebar';
import { Button } from '@/Components/ui/button';
import { Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { CreateTicketDialog } from '@/Pages/Ticket/Create';
import { Sheet, SheetContent } from '@/Components/ui/sheet';

interface TicketLayoutProps {
  title: string;
  categories?: any[];
  departments?: any[];
  users?: any[];
  tags?: any[];
  filters?: {
    status?: string;
    priority?: string;
    department?: string;
    assignee?: string;
    category?: string;
    search?: string;
    myTickets?: boolean;
    sortBy?: string;
  };
  notifications?: any[];
  children: React.ReactNode;
  showSidebar?: boolean;
  backUrl?: string; // URL để back về trang trước
  backLabel?: string; // Label cho back button
  showTabs?: boolean; // Có hiển thị tabs không
  showCreateButton?: boolean; // Có hiển thị nút Create Ticket không
  searchSuggestions?: string[];
  showLable: boolean;
}

const TicketLayout: React.FC<TicketLayoutProps> = ({
  title,
  categories = [],
  departments = [],
  users = [],
  tags = [],
  filters = {},
  notifications = [],
  children,
  showSidebar = true,
  backUrl,
  backLabel = 'Quay lại',
  showTabs = false,
  showCreateButton = false,
  searchSuggestions = [],
  showLable = true,
}) => {
  const { props } = usePage();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className="bg-background">
        <div className="flex">
          {/* Desktop Sidebar - Hidden on mobile */}
          {showSidebar && (
            <div className="hidden lg:block sidebar-fixed top-14 sm:top-16 md:top-18 lg:top-20 sidebar-height">
              <FilterSidebar
                categories={categories}
                departments={departments}
                users={users}
                filters={filters}
                currentUser={(props as any)?.auth?.user}
                searchSuggestions={searchSuggestions}
              />
            </div>
          )}

          {/* Mobile Filter Sheet */}
          {showSidebar && (
            <Sheet
              open={isMobileFilterOpen}
              onOpenChange={setIsMobileFilterOpen}
            >
              <SheetContent side="left" className="w-80 p-0 lg:hidden">
                <FilterSidebar
                  categories={categories}
                  departments={departments}
                  users={users}
                  filters={filters}
                  currentUser={(props as any)?.auth?.user}
                  searchSuggestions={searchSuggestions}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${showSidebar ? 'lg:ml-80' : 'ml-0'}`}>
            {/* Header with Mobile Filter Button, Tabs and Create Button */}
            {(showTabs || showCreateButton || showSidebar) && (
              <div className="">
                <div className="container mx-auto px-4 sm:px-6">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {/* Mobile Filter Button */}
                      {showSidebar && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="lg:hidden"
                          onClick={() => setIsMobileFilterOpen(true)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Bộ lọc
                        </Button>
                      )}
                      {(showLable) && (
                        <div className="hidden sm:block">
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Hỗ trợ khách hàng
                          </h2>
                          <p className="text-sm text-muted-foreground hidden md:block">
                            Duyệt tất cả yêu cầu hỗ trợ và thảo luận cộng đồng
                          </p>
                        </div>
                      )}

                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                      {showTabs && (
                        <Tabs
                          value={
                            filters.myTickets ? 'my-tickets' : 'all-tickets'
                          }
                          onValueChange={value => {
                            if (value === 'my-tickets') {
                              router.get('/tickets/my-tickets');
                            } else {
                              router.get('/tickets');
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                              value="all-tickets"
                              className="text-xs sm:text-sm"
                            >
                              Tất cả
                            </TabsTrigger>
                            <TabsTrigger
                              value="my-tickets"
                              className="text-xs sm:text-sm"
                            >
                              Của tôi
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                      {showCreateButton && (
                        <CreateTicketDialog
                          categories={categories}
                          tags={tags}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content with proper spacing */}
            <div className="relative">
              <ScrollArea className="h-screen">{children}</ScrollArea>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default TicketLayout;
