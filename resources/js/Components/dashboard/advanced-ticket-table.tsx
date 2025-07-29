import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { StatusUpdateDropdown } from './status-update-dropdown';
import { getPriorityColor } from '@/Utils/utils';
import { route } from 'ziggy-js';


interface Post {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    profile_photo_url: string | null;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
    profile_photo_url: string | null;
  };
  department?: {
    id: number;
    name: string;
  };
  comment?: number;
  priority_score?: number;
}

interface AdvancedTicketTableProps {
  posts: Post[];
  refreshKey?: number;
  onRefresh?: () => void;
}

export function AdvancedTicketTable({ posts, refreshKey = 0, onRefresh }: AdvancedTicketTableProps) {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = posts.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || 
                             (assigneeFilter === 'unassigned' && !ticket.assignee) ||
                             (ticket.assignee && ticket.assignee.id.toString() === assigneeFilter);
      const matchesDepartment = departmentFilter === 'all' ||
                               (ticket.department && ticket.department.id.toString() === departmentFilter);
      const matchesCategory = categoryFilter === 'all' ||
                             ((ticket as any).categories && (ticket as any).categories.some((cat: any) =>
                               cat.slug === categoryFilter || cat.id.toString() === categoryFilter
                             ));

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDepartment && matchesCategory;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'priority_score':
          aValue = a.priority_score || 0;
          bValue = b.priority_score || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [posts, searchTerm, statusFilter, priorityFilter, assigneeFilter, departmentFilter, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueAssignees = useMemo(() => {
    const assignees = posts
      .filter(p => p.assignee)
      .map(p => p.assignee!)
      .filter((assignee, index, self) => 
        index === self.findIndex(a => a.id === assignee.id)
      );
    return assignees;
  }, [posts]);

  const uniqueDepartments = useMemo(() => {
    const departments = posts
      .filter(p => p.department)
      .map(p => p.department!)
      .filter((dept, index, self) => 
        index === self.findIndex(d => d.id === dept.id)
      );
    return departments;
  }, [posts]);

  // Handle bulk operations
  const handleBulkAssign = async (assigneeId: number) => {
    setIsLoading(true);
    try {
      await router.post('/admin/tickets/bulk-assign', {
        ticket_ids: selectedTickets,
        assignee_id: assigneeId
      });
      setSelectedTickets([]);
      onRefresh?.();
    } catch (error) {
      console.error('Bulk assign failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    setIsLoading(true);
    try {
      await router.post('/admin/tickets/bulk-status', {
        ticket_ids: selectedTickets,
        status: status
      });
      setSelectedTickets([]);
      onRefresh?.();
    } catch (error) {
      console.error('Bulk status update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    setIsLoading(true);
    try {
      await router.post('/admin/tickets/bulk-priority', {
        ticket_ids: selectedTickets,
        priority: priority
      });
      setSelectedTickets([]);
      onRefresh?.();
    } catch (error) {
      console.error('Bulk priority update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(filteredTickets.map(t => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (ticketId: number, checked: boolean) => {
    if (checked) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
  //     case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
  //     case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'low': return 'bg-green-100 text-green-800 border-green-200';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
  //     case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
  //     default: return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-3 w-3" />;
      case 'in_progress': return <Clock className="h-3 w-3" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      case 'closed': return <CheckCircle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quản lý Tickets
            </CardTitle>
            <CardDescription>
              {filteredTickets.length} of {posts.length} tickets
              {selectedTickets.length > 0 && ` • ${selectedTickets.length} selected`}
            </CardDescription>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="open">Mở</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="resolved">Đã giải quyết</SelectItem>
              <SelectItem value="closed">Đóng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="urgent">Khẩn cấp</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Nhượng quyền</SelectItem>
              <SelectItem value="unassigned">Chưa được chỉ định</SelectItem>
              {uniqueAssignees.map(assignee => (
                <SelectItem key={assignee.id} value={assignee.id.toString()}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {uniqueDepartments.map(dept => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedTickets.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">
              {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nhượng quyền
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Nhượng quyền cho</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueAssignees.map(assignee => (
                  <DropdownMenuItem 
                    key={assignee.id}
                    onClick={() => handleBulkAssign(assignee.id)}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      {/* <AvatarImage src={'/storage/$} alt={assignee.name} /> */}
                      <AvatarImage src={ assignee.profile_photo_url  || ''} />
                      <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {assignee.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                 Trạng thái
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Thay đổi trạng thái thành</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('open')}>
                  Mở
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('in_progress')}>
                  Đang xử lý
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('resolved')}>
                  Đã giải quyết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('closed')}>
                  Đóng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Độ ưu tiên
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Thay đổi độ ưu tiên thành</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkPriorityUpdate('urgent')}>
                  Khẩn cấp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityUpdate('high')}>
                  Cao
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityUpdate('medium')}>
                  Trung bình
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityUpdate('low')}>
                  Thấp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedTickets([])}
            >
              Xóa lựa chọn
            </Button>
          </div>
        )}

        {/* Tickets Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSortBy('title');
                    setSortOrder(sortBy === 'title' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Ticket
                </TableHead>
               
                <TableHead>Người nhận</TableHead>
                <TableHead>Phòng ban</TableHead>

                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSortBy('created_at');
                    setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Ngày tạo
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Độ ưu tiên</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found matching your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedTickets.includes(ticket.id)}
                        onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {ticket.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{ticket.user.name}</span>
                          {ticket.comment && ticket.comment > 0 && (
                            <>
                              <MessageSquare className="h-3 w-3" />
                              <span>{ticket.comment}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignee.profile_photo_url || ''} />
                            <AvatarFallback>{ticket.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.department ? (
                        <div className="flex items-center gap-1">
                          {/* <Building className="h-3 w-3" /> */}
                          <span className="text-sm">{ticket.department.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{ticket.created_at}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusUpdateDropdown
                        ticketId={ticket.id}
                        currentStatus={ticket.status}
                        onStatusUpdated={onRefresh}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      {ticket.priority_score && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Score: {ticket.priority_score}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tickets/${ticket.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem
                            </Link>
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem asChild>
                            <Link href={`/admin/tickets/${ticket.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className='text-red-600'>
                            <Link href={(route('posts.destroy', ticket.id))}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
