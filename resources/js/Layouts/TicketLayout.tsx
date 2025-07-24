import React from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FilterSidebar } from '@/Pages/Ticket/FilterSidebar';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area';
import { route } from 'ziggy-js';
import { CreateTicketDialog } from '@/Pages/Ticket/Create';

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
  backLabel = 'Back',
  showTabs = false,
  showCreateButton = false,
  searchSuggestions = [],
}) => {
  const { props } = usePage();

  return (
    <AppLayout
      title={title}
      canLogin={true}
      canRegister={true}
      notifications={notifications}
    >
      <div className=" bg-background">
        <div className="flex sticky">
          {/* Fixed Sidebar */}
          {showSidebar && (
            <div className="fixed left-0  h-screen w-80 z-10">
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

          {/* Main Content */}
          <main className={`flex-1 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
            {/* Back Button */}
            {/* {backUrl && (
              <div className="p-4 border-b">
                <Button
                  variant="ghost"
                  onClick={() => router.get(backUrl)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {backLabel}
                </Button>
              </div>
            )} */}

            {/* Header with Tabs and Create Button */}

            <ScrollArea className="min-h-screen">
              {(showTabs || showCreateButton) && (
                <div className="mt-3">
                  <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight">
                            Support Tickets
                          </h2>
                          <p className="text-muted-foreground">
                            Browse all support tickets and community discussions
                          </p>
                        </div>

                        {/* Tabs */}
                      </div>

                      <div className="flex items-center gap-4">
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
                            <TabsList>
                              <TabsTrigger value="all-tickets">
                                All Tickets
                              </TabsTrigger>
                              <TabsTrigger value="my-tickets">
                                My Tickets
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
              {children}
            </ScrollArea>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default TicketLayout;
