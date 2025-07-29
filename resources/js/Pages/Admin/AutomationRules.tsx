import React, { useCallback, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Activity,
  Target,
  Users,
  Clock,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

import { toast } from 'sonner';
import { AutomationRule, AutomationRulesProps } from '@/types/rules';
import { StatsCard } from '@/Components/rule/StatsCard';
import { RuleCard } from '@/Components/rule/RuleCard';
import { EmptyState } from '@/Components/notification/NotificationStates';
import { ConfirmDeleteDialog } from '@/Components/rule/ConfirmDeleteDialog';



// Constants moved outside component to prevent recreation

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'matched_count', label: 'Matches' },
  { value: 'execution_order', label: 'Order' },
  { value: 'last_matched_at', label: 'Last Used' },
] as const;

// Memoized components for better performance



export default function AutomationRules({ rules, stats, search: initialSearch }: AutomationRulesProps) {
  // Local state for client-side filtering and sorting
  const [localSearch, setLocalSearch] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState<'name' | 'matched_count' | 'execution_order' | 'last_matched_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);

  // Memoized filtered and sorted rules
  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules.data.filter(rule => {
      const matchesSearch = localSearch === '' || 
        rule.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        rule.description?.toLowerCase().includes(localSearch.toLowerCase());
      
      const matchesStatus = filterByStatus === 'all' || 
        (filterByStatus === 'active' && rule.is_active) ||
        (filterByStatus === 'inactive' && !rule.is_active);
      
      return matchesSearch && matchesStatus;
    });

    // Sort rules
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'last_matched_at') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      const numA = Number(aValue) || 0;
      const numB = Number(bValue) || 0;
      
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [rules.data, localSearch, sortBy, sortOrder, filterByStatus]);

  // Memoized stats calculations
  const calculatedStats = useMemo(() => ({
    ...stats,
    efficiency: stats.active_rules > 0 
      ? Math.round((stats.total_matches / stats.active_rules) * 100) / 100 
      : 0
  }), [stats]);

  // Show delete confirmation dialog
  const handleDelete = useCallback((id: number) => {
    const rule = rules.data.find(r => r.id === id);
    if (rule) {
      setRuleToDelete(rule);
      setDeleteDialogOpen(true);
    }
  }, [rules.data]);

  // Actual delete handler after confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!ruleToDelete || isDeleting) return;
    
    setIsDeleting(ruleToDelete.id);
    router.delete(`/admin/automation-rules/${ruleToDelete.id}`, {
      onSuccess: () => {
        toast.success('Quy tắc tự động đã được xóa thành công');
        setIsDeleting(null);
        setDeleteDialogOpen(false);
        setRuleToDelete(null);
      },
      onError: () => {
        toast.error('Không thể xóa quy tắc tự động');
        setIsDeleting(null);
      },
    });
  }, [ruleToDelete, isDeleting]);

  // Handle dialog close
  const handleDeleteDialogClose = useCallback((open: boolean) => {
    if (!isDeleting) {
      setDeleteDialogOpen(open);
      if (!open) {
        setRuleToDelete(null);
      }
    }
  }, [isDeleting]);

  const handleSortToggle = useCallback((newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy]);

  return (
    <SidebarProvider>
      <Head title="Automation Rules" />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Automation Rules" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Rules"
                  value={calculatedStats.total_rules}
                  subtitle={`${calculatedStats.active_rules} active`}
                  icon={Settings}
                />
                <StatsCard
                  title="Total Matches"
                  value={calculatedStats.total_matches.toLocaleString()}
                  subtitle="All time applications"
                  icon={Target}
                />
                <StatsCard
                  title="Recent Matches"
                  value={calculatedStats.recent_matches.toLocaleString()}
                  subtitle="Last 7 days"
                  icon={Activity}
                />
                <StatsCard
                  title="Efficiency"
                  value={calculatedStats.efficiency}
                  subtitle="Avg matches per rule"
                  icon={Clock}
                />
              </div>

              {/* Main Content */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Automation Rules
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Manage automatic ticket categorization and routing rules
                      </CardDescription>
                    </div>
                    <Link href="/admin/automation-rules/create">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Rule
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Filters and Search */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search rules..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* <div className="flex gap-2">
                      <select
                        value={filterByStatus}
                        onChange={(e) => setFilterByStatus(e.target.value as typeof filterByStatus)}
                        className="px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        {SORT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            Sort by {option.label}
                          </option>
                        ))}
                      </select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSortToggle(sortBy)}
                        className="px-3"
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </div> */}
                  </div>

                  {/* Rules List */}
                  <div className="space-y-4">
                    {filteredAndSortedRules.length > 0 ? (
                      filteredAndSortedRules.map((rule) => (
                        <RuleCard
                          key={rule.id}
                          rule={rule}
                          onDelete={handleDelete}
                          isDeleting={isDeleting === rule.id}
                        />
                      ))
                    ) : localSearch || filterByStatus !== 'all' ? (
                      <div className="text-center py-8">
                        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
                        <p className="text-gray-500 mb-4">
                          Try adjusting your search or filter criteria.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLocalSearch('');
                            setFilterByStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <EmptyState />
                    )}
                  </div>

                  {/* Pagination Info */}
                  {filteredAndSortedRules.length > 0 && (
                    <div className="mt-6 text-sm text-gray-500 text-center">
                      Showing {filteredAndSortedRules.length} of {rules.total} rules
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        rule={ruleToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting === ruleToDelete?.id}
      />
    </SidebarProvider>
  );
}