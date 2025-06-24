import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import { Plus, X, ArrowLeft } from 'lucide-react';

interface Category {
  id: number;
  title: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface AutomationRuleFormData {
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
  assigned_user_id: number | null;
  execution_order: number;
}

interface CreateAutomationRuleProps {
  categories: Category[];
  tags: Tag[];
  departments: Department[];
  users: User[];
  categoryTypes: Record<string, string>;
  priorityLevels: Record<string, string>;
}

export default function CreateAutomationRule({
  categories,
  tags,
  departments,
  users,
  categoryTypes,
  priorityLevels,
}: CreateAutomationRuleProps) {
  const [titleKeywords, setTitleKeywords] = useState<string[]>([]);
  const [contentKeywords, setContentKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isTitleInput, setIsTitleInput] = useState(true);

  const { data, setData, post, processing, errors } = useForm<AutomationRuleFormData>({
    name: '',
    description: '',
    is_active: true,
    conditions: {
      title_keywords: [],
      content_keywords: [],
      category_ids: [],
      tag_ids: [],
    },
    actions: {},
    category_type: 'general',
    assigned_priority: 'medium',
    assigned_department_id: null,
    assigned_user_id: null,
    execution_order: 100,
  });


  const addKeyword = (type: 'title' | 'content') => {
    if (!newKeyword.trim()) return;
    
    const keyword = newKeyword.trim();
    const updatedKeywords = type === 'title' 
      ? [...new Set([...titleKeywords, keyword])]
      : [...new Set([...contentKeywords, keyword])];
    
    if (type === 'title') {
      setTitleKeywords(updatedKeywords);
      setData('conditions', {
        ...data.conditions,
        title_keywords: updatedKeywords,
      });
    } else {
      setContentKeywords(updatedKeywords);
      setData('conditions', {
        ...data.conditions,
        content_keywords: updatedKeywords,
      });
    }
    setNewKeyword('');
  };

  const removeKeyword = (type: 'title' | 'content', index: number) => {
    if (type === 'title') {
      const updated = titleKeywords.filter((_, i) => i !== index);
      setTitleKeywords(updated);
      setData('conditions', {
        ...data.conditions,
        title_keywords: updated,
      });
    } else {
      const updated = contentKeywords.filter((_, i) => i !== index);
      setContentKeywords(updated);
      setData('conditions', {
        ...data.conditions,
        content_keywords: updated,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/admin/automation-rules');
  };

  return (
    <SidebarProvider>
      <Head title="Create Automation Rule" />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Create Automation Rule" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Create New Automation Rule</CardTitle>
                  <CardDescription>
                    Set up automatic ticket categorization and routing based on content analysis
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Rule Name *</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Technical Issues - High Priority"
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        
                        <div>
                          <Label htmlFor="execution_order">Execution Order</Label>
                          <Input
                            id="execution_order"
                            type="number"
                            min="1"
                            max="1000"
                            value={data.execution_order}
                            onChange={(e) => setData('execution_order', parseInt(e.target.value))}
                            placeholder="100"
                          />
                          <p className="text-sm text-gray-500 mt-1">Lower numbers execute first</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          placeholder="Describe what this rule does..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_active"
                          checked={data.is_active}
                          onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Active (rule will be applied to new tickets)</Label>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Trigger Conditions</h3>
                      <p className="text-sm text-gray-600">Define when this rule should be applied</p>
                      
                      {/* Title Keywords */}
                      <div>
                        <Label>Title Keywords</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Enter keyword..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addKeyword('title');
                              }
                            }}
                            onFocus={() => setIsTitleInput(true)}
                          />
                          <Button type="button" onClick={() => addKeyword('title')} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {titleKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeKeyword('title', index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Content Keywords */}
                      <div>
                        <Label>Content Keywords</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Enter keyword..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addKeyword('content');
                              }
                            }}
                            onFocus={() => setIsTitleInput(false)}
                          />
                          <Button type="button" onClick={() => addKeyword('content')} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {contentKeywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeKeyword('content', index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Actions to Take</h3>
                      <p className="text-sm text-gray-600">What should happen when this rule matches</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category_type">Category Type *</Label>
                          <Select value={data.category_type} onValueChange={(value) => setData('category_type', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(categoryTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="assigned_priority">Priority Level *</Label>
                          <Select value={data.assigned_priority} onValueChange={(value) => setData('assigned_priority', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(priorityLevels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="assigned_department_id">Assign to Department</Label>
                          <Select value={data.assigned_department_id || 'none'} onValueChange={(value) => setData('assigned_department_id', value === 'none' ? null : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No assignment</SelectItem>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="assigned_user_id">Assign to User</Label>
                          <Select
                            value={data.assigned_user_id?.toString() || 'none'}
                            onValueChange={(value) => setData('assigned_user_id', value === 'none' ? null : parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select user..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No assignment</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Rule'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
