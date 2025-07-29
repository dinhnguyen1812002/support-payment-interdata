import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  ArrowLeft, 
  Settings, 
  Play, 
  Pause, 
  Edit3, 
  Copy, 
  Trash2,
  Calendar,
  User,
  Building,
  Target,
  Filter,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Code2
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/Components/rule/ConfirmDeleteDialog';

interface AutomationRule {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  conditions: {
    title_keywords: string[];
    content_keywords: string[];
    category_ids: number[];
    tag_ids: number[];
  };
  actions: Record<string, any>;
  category_type: string;
  assigned_priority: string;
  assigned_department_id: string | null;
  assigned_department?: { id: string; name: string };
  assigned_user_id: number | null;
  assigned_user?: { id: number; name: string };
  execution_order: number;
  created_at: string;
  updated_at: string;
}

interface ShowAutomationRuleProps {
  rule: AutomationRule;
  categoryTypes: Record<string, string>;
  priorityLevels: Record<string, string>;
  categories: Array<{ id: number; title: string }>;
  tags: Array<{ id: number; name: string }>;
}

export default function ShowAutomationRule({
  rule,
  categoryTypes,
  priorityLevels,
  categories,
  tags,
}: ShowAutomationRuleProps) {
  const getCategoryName = (id: number) => 
    categories.find(c => c.id === id)?.title || 'Unknown';
    
  const getTagName = (id: number) => 
    tags.find(t => t.id === id)?.name || 'Unknown';

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };


const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      router.delete(route('admin.automation-rules.destroy', rule.id));
    }
  };
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <SiteHeader title={rule.name} />
          <SidebarInset className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={route('admin.automation-rules.index')}>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{rule.name}</h1>
                  <p className="text-muted-foreground">{rule.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={rule.is_active ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {rule.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                
                {/* <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button> */}
                
                <Link href={route('admin.automation-rules.edit', rule.id)}>
                  <Button size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Rule
                  </Button>
                </Link>
                
                <Button variant="outline" size="sm"  className='text-red-500'
                onClick={()=> handleDelete()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Priority</p>
                      <Badge variant={getPriorityColor(rule.assigned_priority)} className="mt-1">
                        {priorityLevels[rule.assigned_priority] || rule.assigned_priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Execution Order</p>
                      <p className="text-lg font-semibold">{rule.execution_order}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm font-semibold">
                        {rule.assigned_department?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Assigned User</p>
                      <p className="text-sm font-semibold">
                        {rule.assigned_user?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="conditions" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Conditions</span>
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Actions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Rule Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Category Type</p>
                          <Badge variant="outline" className="px-3 py-1">
                            {categoryTypes[rule.category_type] || rule.category_type}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                          <div className="flex items-center space-x-2">
                            {rule.is_active ? (
                              <>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-700">Active & Running</span>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-500">Inactive</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Created</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(rule.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(rule.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Trigger Conditions</span>
                    </CardTitle>
                    <CardDescription>
                      These conditions determine when this automation rule will be triggered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {rule.conditions.title_keywords?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <p className="font-medium">Title Keywords</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          {rule.conditions.title_keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="font-mono">
                              "{keyword}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.conditions.content_keywords?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <p className="font-medium">Content Keywords</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          {rule.conditions.content_keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="font-mono">
                              "{keyword}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.conditions.category_ids?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                          <p className="font-medium">Categories</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          {rule.conditions.category_ids.map((id) => (
                            <Badge key={id} variant="outline">
                              {getCategoryName(id)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.conditions.tag_ids?.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          <p className="font-medium">Tags</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-4">
                          {rule.conditions.tag_ids.map((id) => (
                            <Badge key={id} variant="outline">
                              {getTagName(id)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(rule.conditions).every(key => 
                      !rule.conditions[key as keyof typeof rule.conditions]?.length
                    ) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No conditions configured</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Automation Actions</span>
                    </CardTitle>
                    <CardDescription>
                      These actions will be executed when the conditions are met
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Code2 className="h-4 w-4" />
                          <span className="font-medium text-sm">Action Configuration</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm overflow-auto max-h-96 text-slate-800 dark:text-slate-200">
                        {JSON.stringify(rule.actions, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Footer Information */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>Rule ID: #{rule.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Created: {new Date(rule.created_at).toLocaleString()}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Last Updated: {new Date(rule.updated_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      View Logs
                    </Button>
                    <Button variant="ghost" size="sm">
                      Test Rule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}