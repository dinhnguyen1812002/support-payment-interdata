import React from 'react';
import { Check, Clock, AlertCircle, Users, Zap } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  responseTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ticketCount: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  popular?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  description,
  icon,
  responseTime,
  priority,
  ticketCount,
  isSelected,
  onSelect,
  popular = false
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'urgent': return <Zap className="w-3 h-3" />;
      case 'high': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02]`}
      onClick={() => onSelect(id)}
    >
      {/* Selection Indicator */}
      {/* <div className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
        isSelected 
          ? ' border-blue-500' 
          : 'bg-white border-gray-300 group-hover:border-blue-300'
      }`}>
        {isSelected && (
          <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
        )}
      </div> */}

      {/* Popular Badge */}
      {/* {popular && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Popular
        </div>
      )} */}

      {/* Card Content */}
      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${
          isSelected 
            ? 'bg-blue-100' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50'
        }`}>
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Response Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{responseTime}</span>
          </div>

          {/* Ticket Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{ticketCount} tickets</span>
          </div>
        </div>

        {/* Priority Badge */}
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
          {getPriorityIcon()}
          <span className="capitalize">{priority} Priority</span>
        </div>
      </div>

      {/* Selection Overlay */}
      <div className={`absolute inset-0  bg-opacity-5 rounded-2xl transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
};

export default CategoryCard;