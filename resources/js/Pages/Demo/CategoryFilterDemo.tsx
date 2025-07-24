import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CategoryFilter, CategoryQuickFilter, CategoryDisplay } from '@/Components/CategoryFilter';
import TicketLayout from '@/Layouts/TicketLayout';

interface Category {
  id: number;
  title: string;
  slug: string;
  posts_count: number;
  description?: string;
}

interface CategoryFilterDemoProps {
  categories: Category[];
}

export default function CategoryFilterDemo({ categories }: CategoryFilterDemoProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [quickFilterCategory, setQuickFilterCategory] = useState<string | undefined>();

  // Mock tickets data for demonstration
  const mockTickets = [
    {
      id: '1',
      title: 'Bug in payment system',
      categories: categories.slice(0, 2),
    },
    {
      id: '2', 
      title: 'Feature request for dashboard',
      categories: categories.slice(1, 3),
    },
    {
      id: '3',
      title: 'Performance issue',
      categories: [categories[0]],
    },
  ];

  return (
    <TicketLayout title="Category Filter Demo">
      <Head title="Category Filter Demo" />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Category Filter Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test the category filtering functionality with different components
          </p>
        </div>

        {/* Category Filter Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Filter Dropdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default</label>
                  <CategoryFilter
                    categories={categories}
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">With Post Count</label>
                  <CategoryFilter
                    categories={categories}
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    showPostCount={true}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Small Size</label>
                  <CategoryFilter
                    categories={categories}
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    size="sm"
                    showPostCount={true}
                  />
                </div>
              </div>
              
              {selectedCategory && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected Category:</strong> {categories.find(c => c.slug === selectedCategory || c.id.toString() === selectedCategory)?.title}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Filter Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Filter Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CategoryQuickFilter
                categories={categories}
                selectedCategory={quickFilterCategory}
                onCategoryChange={setQuickFilterCategory}
              />
              
              {quickFilterCategory && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Quick Filter Selected:</strong> {categories.find(c => c.slug === quickFilterCategory || c.id.toString() === quickFilterCategory)?.title}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Display */}
        <Card>
          <CardHeader>
            <CardTitle>Category Display Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Different Sizes</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">XS:</span>
                    <CategoryDisplay categories={categories.slice(0, 3)} size="xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">SM:</span>
                    <CategoryDisplay categories={categories.slice(0, 3)} size="sm" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">MD:</span>
                    <CategoryDisplay categories={categories.slice(0, 3)} size="md" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Max Display Limits</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">Max 1:</span>
                    <CategoryDisplay categories={categories} maxDisplay={1} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">Max 2:</span>
                    <CategoryDisplay categories={categories} maxDisplay={2} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-16">Max 3:</span>
                    <CategoryDisplay categories={categories} maxDisplay={3} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock Tickets with Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Mock Tickets with Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{ticket.title}</h3>
                  <CategoryDisplay
                    categories={ticket.categories}
                    maxDisplay={3}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Results */}
        {(selectedCategory || quickFilterCategory) && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Active Filters:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedCategory && (
                    <li>• Dropdown Filter: {categories.find(c => c.slug === selectedCategory || c.id.toString() === selectedCategory)?.title}</li>
                  )}
                  {quickFilterCategory && (
                    <li>• Quick Filter: {categories.find(c => c.slug === quickFilterCategory || c.id.toString() === quickFilterCategory)?.title}</li>
                  )}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  In a real application, this would filter the tickets list based on the selected categories.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Available Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{category.title}</h4>
                  <p className="text-sm text-muted-foreground">{category.posts_count} posts</p>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TicketLayout>
  );
}
