import React from 'react';
import { Head } from '@inertiajs/react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <SiteHeader title={rule.name} />
          <SidebarInset className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href={route('admin.automation-rules.index')}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">View Automation Rule</h1>
              </div>
              <div className="flex space-x-2">
                <Link href={route('admin.automation-rules.edit', rule.id)}>
                  <Button>Edit Rule</Button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{rule.name}</CardTitle>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category Type</p>
                      <p>{categoryTypes[rule.category_type] || rule.category_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Priority</p>
                      <p>{priorityLevels[rule.assigned_priority] || rule.assigned_priority}</p>
                    </div>
                    {rule.assigned_department && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assigned Department</p>
                        <p>{rule.assigned_department.name}</p>
                      </div>
                    )}
                    {rule.assigned_user && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assigned User</p>
                        <p>{rule.assigned_user.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Execution Order</p>
                      <p>{rule.execution_order}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rule.conditions.title_keywords?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Title Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.title_keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.conditions.content_keywords?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Content Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.content_keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.conditions.category_ids?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
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
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.tag_ids.map((id) => (
                          <Badge key={id} variant="outline">
                            {getTagName(id)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(rule.actions, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(rule.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(rule.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
