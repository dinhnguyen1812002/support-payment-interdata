import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
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
import { route } from 'ziggy-js';

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

interface EditAutomationRuleProps {
  rule: AutomationRuleFormData & { id: number };
  categories: Category[];
  tags: Tag[];
  departments: Department[];
  users: User[];
  categoryTypes: Record<string, string>;
  priorityLevels: Record<string, string>;
}

export default function EditAutomationRule({
  rule: initialRule,
  categories,
  tags,
  departments,
  users,
  categoryTypes,
  priorityLevels,
}: EditAutomationRuleProps) {
  const { data, setData, put, processing, errors } = useForm<AutomationRuleFormData>({
    ...initialRule,
  });

  const [newTitleKeyword, setNewTitleKeyword] = useState('');
  const [newContentKeyword, setNewContentKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialRule.conditions.category_ids || []
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(
    initialRule.conditions.tag_ids || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.automation-rules.update', initialRule.id));
  };

  const addTitleKeyword = () => {
    if (newTitleKeyword.trim() && !data.conditions.title_keywords.includes(newTitleKeyword.trim())) {
      setData('conditions', {
        ...data.conditions,
        title_keywords: [...data.conditions.title_keywords, newTitleKeyword.trim()],
      });
      setNewTitleKeyword('');
    }
  };

  const removeTitleKeyword = (keyword: string) => {
    setData('conditions', {
      ...data.conditions,
      title_keywords: data.conditions.title_keywords.filter(k => k !== keyword),
    });
  };

  const addContentKeyword = () => {
    if (newContentKeyword.trim() && !data.conditions.content_keywords.includes(newContentKeyword.trim())) {
      setData('conditions', {
        ...data.conditions,
        content_keywords: [...data.conditions.content_keywords, newContentKeyword.trim()],
      });
      setNewContentKeyword('');
    }
  };

  const removeContentKeyword = (keyword: string) => {
    setData('conditions', {
      ...data.conditions,
      content_keywords: data.conditions.content_keywords.filter(k => k !== keyword),
    });
  };

  const toggleCategory = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    setData('conditions', {
      ...data.conditions,
      category_ids: newCategories,
    });
  };

  const toggleTag = (tagId: number) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    setData('conditions', {
      ...data.conditions,
      tag_ids: newTags,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <SiteHeader title="Edit Automation Rule" />
          <SidebarInset className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href={route('admin.automation-rules.index')}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Edit Automation Rule</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure the basic settings for this automation rule.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter rule name"
                        required
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="execution_order">Execution Order</Label>
                      <Input
                        id="execution_order"
                        type="number"
                        value={data.execution_order}
                        onChange={(e) => setData('execution_order', parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                      {errors.execution_order && (
                        <p className="text-sm text-red-500">{errors.execution_order}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Enter rule description"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                    />
                    <Label htmlFor="is_active">Enable this rule</Label>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Conditions</CardTitle>
                  <CardDescription>Define when this rule should be triggered.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Title Keywords</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newTitleKeyword}
                        onChange={(e) => setNewTitleKeyword(e.target.value)}
                        placeholder="Add title keyword"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTitleKeyword())}
                      />
                      <Button type="button" onClick={addTitleKeyword}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.conditions.title_keywords.map((keyword, i) => (
                        <Badge key={i} className="flex items-center gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeTitleKeyword(keyword)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Keywords</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newContentKeyword}
                        onChange={(e) => setNewContentKeyword(e.target.value)}
                        placeholder="Add content keyword"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addContentKeyword())}
                      />
                      <Button type="button" onClick={addContentKeyword}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.conditions.content_keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeContentKeyword(keyword)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label htmlFor={`category-${category.id}`}>{category.title}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => toggleTag(tag.id)}
                          />
                          <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Define what happens when this rule is triggered.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_type">Category Type</Label>
                      <Select
                        value={data.category_type || 'none'}
                        onValueChange={(value) => setData('category_type', value === 'none' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>
                            Select a category type
                          </SelectItem>
                          {Object.entries(categoryTypes).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_type && (
                        <p className="text-sm text-red-500">{errors.category_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assigned_priority">Priority</Label>
                      <Select
                        value={data.assigned_priority || 'none'}
                        onValueChange={(value) => setData('assigned_priority', value === 'none' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>
                            Select a priority
                          </SelectItem>
                          {Object.entries(priorityLevels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assigned_priority && (
                        <p className="text-sm text-red-500">{errors.assigned_priority}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assigned_department_id">Assign to Department</Label>
                      <Select
                        value={data.assigned_department_id || 'none'}
                        onValueChange={(value) => setData('assigned_department_id', value === 'none' ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No department</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assigned_user_id">Assign to User</Label>
                      <Select
                        value={data.assigned_user_id ? data.assigned_user_id.toString() : 'none'}
                        onValueChange={(value) => setData('assigned_user_id', value === 'none' ? null : parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No user</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Link href={route('admin.automation-rules.show', initialRule.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
