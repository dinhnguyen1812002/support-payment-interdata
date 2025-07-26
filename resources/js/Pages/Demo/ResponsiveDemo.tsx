import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Menu, 
  Search, 
  User, 
  Bell,
  ChevronDown,
  Home,
  Ticket,
  Settings
} from 'lucide-react';

export default function ResponsiveDemo() {
  return (
    <AppLayout
      title="Responsive Navigation Demo"
      canLogin={true}
      canRegister={true}
      notifications={[]}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="responsive-container py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Responsive Navigation Demo
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Test the responsive navigation across different screen sizes
              </p>
            </div>

            {/* Responsive Breakpoints */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Responsive Breakpoints
                </CardTitle>
                <CardDescription>
                  Navigation adapts to different screen sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Mobile</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        &lt; 768px
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Hamburger Menu
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Tablet className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Tablet</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        768px - 1024px
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Compact Nav
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Monitor className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Desktop</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        &gt; 1024px
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Full Navigation
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Features */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Navigation Features</CardTitle>
                <CardDescription>
                  Responsive elements and their behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Mobile Features */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile (< 768px)
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Menu className="h-4 w-4 text-gray-500" />
                        Hamburger menu for navigation
                      </li>
                      <li className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        Search moved to mobile menu
                      </li>
                      <li className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Compact user avatar only
                      </li>
                      <li className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-gray-500" />
                        Notification icon only
                      </li>
                    </ul>
                  </div>

                  {/* Desktop Features */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Desktop (> 1024px)
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        Full navigation links visible
                      </li>
                      <li className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        Search with keyboard shortcut
                      </li>
                      <li className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        User name + avatar display
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                        Dropdown menus
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Instructions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Test Instructions</CardTitle>
                <CardDescription>
                  How to test the responsive navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      🔍 Testing Steps
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <li>Resize your browser window to different widths</li>
                      <li>Test mobile view (&lt; 768px) - check hamburger menu</li>
                      <li>Test tablet view (768px - 1024px) - check compact layout</li>
                      <li>Test desktop view (&gt; 1024px) - check full navigation</li>
                      <li>Try the search functionality (Ctrl+K)</li>
                      <li>Test user dropdown menu</li>
                      <li>Check notification dropdown</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      📱 Mobile Testing
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use browser dev tools to simulate different devices:
                      iPhone, iPad, Android phones, etc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Screen Size Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>Current Screen Size</CardTitle>
                <CardDescription>
                  Live indicator of current breakpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="block sm:hidden">
                    📱 Mobile (&lt; 640px)
                  </Badge>
                  <Badge variant="outline" className="hidden sm:block md:hidden">
                    📱 Small (&gt;= 640px)
                  </Badge>
                  <Badge variant="outline" className="hidden md:block lg:hidden">
                    📱 Medium (&gt;= 768px)
                  </Badge>
                  <Badge variant="outline" className="hidden lg:block xl:hidden">
                    💻 Large (&gt;= 1024px)
                  </Badge>
                  <Badge variant="outline" className="hidden xl:block">
                    🖥️ Extra Large (&gt;= 1280px)
                  </Badge>
                </div>
                
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Navigation State:</strong>
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li className="block md:hidden">
                      ✅ Mobile menu active
                    </li>
                    <li className="hidden md:block">
                      ✅ Desktop navigation active
                    </li>
                    <li className="hidden lg:block">
                      ✅ Full user info displayed
                    </li>
                    <li className="hidden sm:block">
                      ✅ Search button with shortcut
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/all" className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  View Tickets
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/demo/search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
