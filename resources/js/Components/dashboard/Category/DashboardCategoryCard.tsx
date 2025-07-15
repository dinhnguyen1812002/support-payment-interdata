import React from 'react';
import { FileText, Users } from 'lucide-react';
import { Category } from '@/types';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';

interface DashboardCategoryCardProps extends Category {
  isSelected: boolean;

  selectCategory: (slug: string) => void;
}
const selectCategory = (slug: string) => {
  router.get( `/categories/${slug}/posts`);
};

const DashboardCategoryCard: React.FC<DashboardCategoryCardProps> = ({
  id,
  title,
  slug,
  description,
  logo,
  posts_count = 0,
  isSelected,
  selectCategory
}) => {
  return (
    <div
      className={`group relative bg-white dark:bg-black rounded-2xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
      }`}
      onClick={() => selectCategory(slug)}
    >
      {/* Popular badge */}
      {posts_count > 50 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          Popular
        </div>
      )}

      <div className="p-6">
        {/* Header with icon and title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}>
            {logo ? (
              <img 
                src={ `/storage/${logo}` } 
                alt={title}
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <FileText className="w-6 h-6" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-lg mb-1 transition-colors ${
              isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
            }`}>
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {description || 'No description available'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{posts_count} posts</span>
          </div>
          
          {/* Selection indicator */}
          {/* <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
          }`}>
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div> */}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity ${
        isSelected
          ? 'bg-blue-500/5 dark:bg-blue-400/10'
          : 'bg-transparent group-hover:bg-blue-500/5 dark:group-hover:bg-blue-400/10'
      }`} />
    </div>
  );
};

export default DashboardCategoryCard;
