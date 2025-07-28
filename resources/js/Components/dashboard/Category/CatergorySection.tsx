import React, { useState } from 'react';
import { Search, Filter, HelpCircle, Settings, Bug, CreditCard, Shield, Smartphone, Globe, MessageSquare, FileText, Headphones, Moon, Sun, Plus } from 'lucide-react';
import DashboardCategoryCard from './DashboardCategoryCard';
import { Category } from '@/types';
import { useDarkMode } from '@/Hooks/useDarkMode';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';


// const categories = [
//   {
//     id: '1',
//     name: 'Technical Support',
//     description: 'Get help with technical issues, bugs, and system problems',
//     icon: <Settings className="w-6 h-6" />,
//     responseTime: '2-4 hours',
//     priority: 'high' as const,
//     ticketCount: 1247,
//     popular: true
//   },
//   {
//     id: '2',
//     name: 'Bug Report',
//     description: 'Report software bugs, glitches, or unexpected behavior',
//     icon: <Bug className="w-6 h-6" />,
//     responseTime: '1-2 hours',
//     priority: 'urgent' as const,
//     ticketCount: 892
//   },
//   {
//     id: '3',
//     name: 'Billing & Payments',
//     description: 'Questions about billing, payments, refunds, and subscriptions',
//     icon: <CreditCard className="w-6 h-6" />,
//     responseTime: '4-6 hours',
//     priority: 'medium' as const,
//     ticketCount: 634,
//     popular: true
//   },
//   {
//     id: '4',
//     name: 'Security & Privacy',
//     description: 'Security concerns, privacy questions, and account safety',
//     icon: <Shield className="w-6 h-6" />,
//     responseTime: '1-3 hours',
//     priority: 'high' as const,
//     ticketCount: 423
//   },
//   {
//     id: '5',
//     name: 'Mobile App',
//     description: 'Issues specific to mobile applications and mobile experience',
//     icon: <Smartphone className="w-6 h-6" />,
//     responseTime: '3-5 hours',
//     priority: 'medium' as const,
//     ticketCount: 567
//   },
//   {
//     id: '6',
//     name: 'Website Issues',
//     description: 'Problems with website functionality, loading, or navigation',
//     icon: <Globe className="w-6 h-6" />,
//     responseTime: '2-4 hours',
//     priority: 'medium' as const,
//     ticketCount: 789
//   },
//   {
//     id: '7',
//     name: 'Feature Request',
//     description: 'Suggest new features or improvements to existing functionality',
//     icon: <MessageSquare className="w-6 h-6" />,
//     responseTime: '1-2 days',
//     priority: 'low' as const,
//     ticketCount: 1156
//   },
//   {
//     id: '8',
//     name: 'Documentation',
//     description: 'Questions about documentation, guides, and how-to resources',
//     icon: <FileText className="w-6 h-6" />,
//     responseTime: '6-8 hours',
//     priority: 'low' as const,
//     ticketCount: 345
//   },
//   {
//     id: '9',
//     name: 'General Inquiry',
//     description: 'General questions and inquiries that don\'t fit other categories',
//     icon: <HelpCircle className="w-6 h-6" />,
//     responseTime: '4-8 hours',
//     priority: 'low' as const,
//     ticketCount: 892
//   }
// ];

const CategorySelection: React.FC <{categories: Category[]}> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Debug: Log categories to console
  // console.log('Categories received:', categories);

  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleCategorySelect = (slug: string) => {
     router.get(`/categories/${slug}/posts`);
    setSelectedCategory(slug);
  };

  // const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1014] justify-center">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F1014] shadow-sm sticky top-0 z-20 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trung tâm hỗ trợ khách hàng</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Bạn cần giúp đỡ ở sản phẩm nào</p>
            </div>

            {/* Dark Mode Toggle */}
            {/* <div className="flex items-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div> */}

            {/* {selectedCategory && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-6 py-4">
                <div className="text-sm text-blue-600 font-medium">Selected Category</div>
                <div className="text-lg font-bold text-gray-900">
                  {selectedCategoryData?.name}
                </div>
                <div className="text-sm text-gray-600">
                  Expected response: {selectedCategoryData?.responseTime}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-end mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md flex justify-end">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 
              rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
            />
              <Link href="/posts/create" className="w-full sm:w-auto ml-2">
             {/* <Button className="h-full  rounded-xl dark:bg-gray-700 dark:text-white" variant={"outline"} >
                <Plus className="h-4 w-4 mr-2" />
            Tạo ticket
            </Button> */}
            <Button className="h-full rounded-xl ">
              <Plus className="h-4 w-4 mr-2" />
            Tạo ticket
            </Button>
            </Link>
          </div>
          
          
          {/* Priority Filter */}
          {/* <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <DashboardCategoryCard
              key={category.id}
              {...category}
              isSelected={selectedCategory === category.slug}
              selectCategory={handleCategorySelect}

            />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-lg font-medium">No categories found</div>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      {/* {selectedCategory && (
        <div className="fixed bottom-6 right-6 z-30">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 shadow-xl transition-all duration-200 flex items-center gap-3 font-semibold">
            <span>Continue with {selectedCategoryData?.name}</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </button>
        </div>
      )} */}

      {/* Quick Stats */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.4h</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.8/5</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default CategorySelection;