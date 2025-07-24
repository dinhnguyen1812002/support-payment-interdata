import { useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import { Ticket } from "@/types/ticket";

interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  assignee?: string;
  myTickets?: boolean;
  sortBy?: string;
}

const TICKETS_PER_PAGE = 5;

export function useTickets(initialTickets?: any[], initialFilters?: TicketFilters) {
  const { props } = usePage();
  const [filters, setFilters] = useState<TicketFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(1);

  // Get tickets from props or use initial tickets
  const tickets: Ticket[] = useMemo(() => {
    if (initialTickets) {
      return initialTickets.map((ticket: any) => ({
        id: ticket.id,
        slug: ticket.slug || '',
        title: ticket.title || 'Untitled',
        content: ticket.content || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        created_at: ticket.created_at || '',
        updated_at: ticket.updated_at || ticket.created_at || '',
        user: {
          id: ticket.user?.id || 0,
          name: ticket.user?.name || 'Unknown',
          email: ticket.user?.email || '',
          profile_photo_path: ticket.user?.profile_photo_path
        },
        assignee: ticket.assignee ? {
          id: ticket.assignee.id,
          name: ticket.assignee.name,
          email: ticket.assignee.email || '',
          profile_photo_path: ticket.assignee.profile_photo_path
        } : undefined,
        department: ticket.department,
        categories: ticket.categories || [],
        tags: ticket.tags || [],
        upvote_count: ticket.upvote_count || 0,
        has_upvote: ticket.has_upvote || false,
        comments: ticket.comments || [],
        comments_count: ticket.comments_count || 0
      }));
    }
    return [];
  }, [initialTickets]);

  const currentUser = (props as any)?.auth?.user;

  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter((ticket: Ticket) => {
      if (filters.myTickets && currentUser && ticket.user.id !== currentUser.id) {
        return false;
      }

      if (filters.priority && ticket.priority !== filters.priority) {
        return false;
      }

      if (filters.status && ticket.status !== filters.status) {
        return false;
      }

      if (filters.category && ticket.categories) {
        const hasCategory = ticket.categories.some((cat: any) =>
          cat.slug === filters.category || cat.id.toString() === filters.category
        );
        if (!hasCategory) {
          return false;
        }
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.content.toLowerCase().includes(searchLower) ||
          (ticket.tags && ticket.tags.some((tag: any) => tag.name.toLowerCase().includes(searchLower)))
        );
      }

      return true;
    });

    // Apply sorting
    const sortBy = filters.sortBy || "newest";
    switch (sortBy) {
      case "oldest":
        return filtered.sort(
          (a: Ticket, b: Ticket) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "most-upvoted":
        return filtered.sort((a: Ticket, b: Ticket) => (b.upvote_count || 0) - (a.upvote_count || 0));
      case "most-replies":
        return filtered.sort((a: Ticket, b: Ticket) => (b.comments_count || 0) - (a.comments_count || 0));
      case "newest":
      default:
        return filtered.sort(
          (a: Ticket, b: Ticket) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [tickets, filters, currentUser]);

  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + TICKETS_PER_PAGE
  );

  // Get notifications from props
  const notifications = (props as any)?.notifications || [];
  const unreadNotifications = useMemo(() => {
    return notifications.filter((notif: any) => !notif.read);
  }, [notifications]);

  const updateFilters = (newFilters: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change

    // Navigate with new filters using Inertia
    const searchParams = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    router.get(`/tickets?${searchParams.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const createTicket = (ticketData: any) => {
    // Use Inertia to navigate to create page or submit form
    router.post('/tickets', ticketData);
  };

  const toggleUpvote = (ticketId: string | number) => {
    // Make API call to toggle upvote
    router.post(`/tickets/${ticketId}/upvote`, {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Optionally refresh the page data
        router.reload({ only: ['tickets'] });
      }
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    router.post(`/notifications/${notificationId}/read`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const markAllNotificationsAsRead = () => {
    router.post('/notifications/mark-all-read', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);

    // Navigate with pagination using Inertia
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
    searchParams.set('page', newPage.toString());

    router.get(`/tickets?${searchParams.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return {
    tickets: paginatedTickets,
    totalTickets: filteredTickets.length,
    currentPage,
    totalPages,
    ticketsPerPage: TICKETS_PER_PAGE,
    notifications,
    unreadNotifications,
    filters,
    currentUser,
    updateFilters,
    createTicket,
    toggleUpvote,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    goToPage,
  };
}
