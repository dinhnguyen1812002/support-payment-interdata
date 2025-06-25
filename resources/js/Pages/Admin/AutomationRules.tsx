import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Activity,
  Target,
  Users,
  Clock
} from 'lucide-react';
import { Category, Tag, Department, User } from '@/types';
import { toast } from 'sonner';

interface AutomationRule {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  categories: Category[];
  tags: Tag[];
  departments: Department[];
  users: User[];
  category_type: string;
  assigned_priority: string;
  execution_order: number;
  matched_count: number;
  last_matched_at: string | null;
  assigned_department?: {
    id: string;
    name: string;
  };
  assigned_user?: {
    id: number;
    name: string;
  };
}

interface Stats {
  total_rules: number;
  active_rules: number;
  total_matches: number;
  recent_matches: number;
  top_rules: Array<{
    id: number;
    name: string;
    matched_count: number;
  }>;
}

interface AutomationRulesProps {
  rules: {
    data: AutomationRule[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: Stats;
  search: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const categoryColors = {
  technical: 'bg-purple-100 text-purple-800',
  payment: 'bg-green-100 text-green-800',
  consultation: 'bg-yellow-100 text-yellow-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function AutomationRules({ rules, stats, search }: AutomationRulesProps) {
  function handleDelete(id: number): void {
    router.delete(`/admin/automation-rules/${id}`, {
      onSuccess: () => {
        console.log('Automation rule deleted successfully');
        toast.success('Automation rule deleted successfully');
      },
      onError: (errors) => {
        toast.error('Failed to delete automation rule');
      },
    }); 
    
  }

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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_rules}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.active_rules} active
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_matches}</div>
                    <p className="text-xs text-muted-foreground">
                      All time applications
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Matches</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recent_matches}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 7 days
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.active_rules > 0 ? Math.round((stats.total_matches / stats.active_rules) * 100) / 100 : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg matches per rule
                    </p>
                  </CardContent>
                </Card>
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
                  <div className="space-y-4">
                    {rules.data.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{rule.name}</h3>
                              <div className="flex items-center gap-2">
                                {rule.is_active ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                                <Badge className={categoryColors[rule.category_type as keyof typeof categoryColors]}>
                                  {rule.category_type}
                                </Badge>
                                <Badge className={priorityColors[rule.assigned_priority as keyof typeof priorityColors]}>
                                  {rule.assigned_priority}
                                </Badge>
                              </div>
                            </div>
                            
                            {rule.description && (
                              <p className="text-gray-600 mb-3">{rule.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Order: {rule.execution_order}</span>
                              <span>Matches: {rule.matched_count}</span>
                              {rule.assigned_department && (
                                <span>Dept: {rule.assigned_department.name}</span>
                              )}
                              {rule.assigned_user && (
                                <span>Assignee: {rule.assigned_user.name}</span>
                              )}
                              {rule.last_matched_at && (
                                <span>Last used: {new Date(rule.last_matched_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Link href={`/admin/automation-rules/${rule.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/automation-rules/${rule.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                             onClick={() => handleDelete(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {rules.data.length === 0 && (
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first automation rule.</p>
                        <Link href="/admin/automation-rules/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Rule
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
