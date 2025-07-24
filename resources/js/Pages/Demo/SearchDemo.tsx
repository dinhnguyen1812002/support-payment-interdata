import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { SearchInput } from '@/Components/SearchInput';
import { SearchBar } from '@/Components/SearchBar';
import TicketLayout from '@/Layouts/TicketLayout';

export default function SearchDemo() {
  const [searchValue1, setSearchValue1] = useState('');
  const [searchValue2, setSearchValue2] = useState('');
  const [searchValue3, setSearchValue3] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);

  // Mock search results for SearchBar
  const mockSearchResults = [
    {
      id: '1',
      title: 'Payment gateway not working',
      type: 'ticket' as const,
      slug: 'payment-gateway-not-working',
      excerpt: 'Users are unable to complete payments through the gateway',
      category: 'Technical Support',
      status: 'open',
    },
    {
      id: '2',
      title: 'Feature Request',
      type: 'category' as const,
      slug: 'feature-request',
      excerpt: 'Category for new feature requests',
    },
    {
      id: '3',
      title: 'John Doe',
      type: 'user' as const,
      slug: 'john-doe',
      excerpt: 'Support Agent',
    },
  ];

  const handleGlobalSearch = (query: string) => {
    // Simulate search API call
    if (query.trim()) {
      const filtered = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.excerpt?.toLowerCase().includes(query.toLowerCase())
      );
      setGlobalSearchResults(filtered);
    } else {
      setGlobalSearchResults([]);
    }
  };

  return (
    <TicketLayout title="Search Demo">
      <Head title="Search Demo" />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Search Components Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test different search components and their features
          </p>
        </div>

        {/* SearchInput Component */}
        <Card>
          <CardHeader>
            <CardTitle>SearchInput Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Basic Search with History</h4>
                <SearchInput
                  value={searchValue1}
                  placeholder="Search with history..."
                  onSearch={setSearchValue1}
                  showHistory={true}
                  showSuggestions={true}
                  storageKey="demo-search-1"
                />
                {searchValue1 && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <strong>Search Value:</strong> {searchValue1}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Search with Custom Suggestions</h4>
                <SearchInput
                  value={searchValue2}
                  placeholder="Search with suggestions..."
                  onSearch={setSearchValue2}
                  showHistory={true}
                  showSuggestions={true}
                  suggestions={['bug report', 'feature request', 'urgent issue', 'payment problem']}
                  storageKey="demo-search-2"
                />
                {searchValue2 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                    <strong>Search Value:</strong> {searchValue2}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Different Sizes</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Small</label>
                    <SearchInput
                      placeholder="Small search..."
                      onSearch={() => {}}
                      size="sm"
                      showHistory={false}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Medium (Default)</label>
                    <SearchInput
                      placeholder="Medium search..."
                      onSearch={() => {}}
                      size="md"
                      showHistory={false}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Large</label>
                    <SearchInput
                      placeholder="Large search..."
                      onSearch={() => {}}
                      size="lg"
                      showHistory={false}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">API Suggestions</h4>
                <SearchInput
                  value={searchValue3}
                  placeholder="Search with API suggestions..."
                  onSearch={setSearchValue3}
                  showHistory={true}
                  showSuggestions={true}
                  enableApiSuggestions={true}
                  apiSuggestionsUrl="/api/search/suggestions"
                  storageKey="demo-api-search"
                />
                {searchValue3 && (
                  <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                    <strong>API Search Value:</strong> {searchValue3}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">No History/Suggestions</h4>
                <SearchInput
                  placeholder="Simple search without features..."
                  onSearch={() => {}}
                  showHistory={false}
                  showSuggestions={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SearchBar Component */}
        <Card>
          <CardHeader>
            <CardTitle>SearchBar Component (Global Search)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Global Search with Results</h4>
                <SearchBar
                  placeholder="Search tickets, categories, users..."
                  onSearch={handleGlobalSearch}
                  results={globalSearchResults}
                  showShortcut={true}
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Try searching for "payment", "feature", or "john"
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Without Keyboard Shortcut</h4>
                <SearchBar
                  placeholder="Search without shortcut..."
                  onSearch={() => {}}
                  showShortcut={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Features */}
        <Card>
          <CardHeader>
            <CardTitle>Search Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">SearchInput Features</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✅ Debounced search (500ms default)</li>
                  <li>✅ Search history with localStorage</li>
                  <li>✅ Custom suggestions</li>
                  <li>✅ Popular searches</li>
                  <li>✅ Clear search functionality</li>
                  <li>✅ Active search badge</li>
                  <li>✅ Multiple sizes (sm, md, lg)</li>
                  <li>✅ Keyboard navigation</li>
                  <li>✅ Click outside to close</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">SearchBar Features</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>✅ Global search with results</li>
                  <li>✅ Keyboard shortcuts (Cmd/Ctrl + K)</li>
                  <li>✅ Result type indicators</li>
                  <li>✅ Arrow key navigation</li>
                  <li>✅ Direct navigation to results</li>
                  <li>✅ Loading states</li>
                  <li>✅ "Search all" fallback</li>
                  <li>✅ Escape to close</li>
                  <li>✅ Enter to select</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">SearchInput in Sidebar</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<SearchInput
  value={filters.search || ''}
  placeholder="Search tickets..."
  onSearch={(value) => updateFilters({ search: value || undefined })}
  showHistory={true}
  storageKey="ticket-search-history"
  suggestions={['bug', 'feature request', 'urgent']}
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">SearchBar in Header</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<SearchBar
  placeholder="Search tickets, categories..."
  onSearch={handleGlobalSearch}
  results={searchResults}
  isLoading={isSearching}
  showShortcut={true}
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Global Shortcuts</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Focus search</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Cmd/Ctrl + K</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Close dropdown</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Escape</code>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Navigation</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Navigate down</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">↓</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Navigate up</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">↑</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Select result</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">Enter</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TicketLayout>
  );
}
