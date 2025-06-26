import { AutomationRule } from "@/types/rules";

import {Eye, Edit, Trash2 } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "@inertiajs/react";

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
} as const;

const CATEGORY_COLORS = {
  technical: 'bg-purple-100 text-purple-800',
  payment: 'bg-green-100 text-green-800',
  consultation: 'bg-yellow-100 text-yellow-800',
  general: 'bg-gray-100 text-gray-800',
} as const;

export const RuleCard = React.memo(({ 
  rule, 
  onDelete 
}: { 
  rule: AutomationRule; 
  onDelete: (id: number) => void;
}) => (
  <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-lg">{rule.name}</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant={rule.is_active ? "default" : "secondary"}
              className={rule.is_active ? "bg-green-100 text-green-800" : ""}
            >
              {rule.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge className={CATEGORY_COLORS[rule.category_type as keyof typeof CATEGORY_COLORS]}>
              {rule.category_type}
            </Badge>
            <Badge className={PRIORITY_COLORS[rule.assigned_priority as keyof typeof PRIORITY_COLORS]}>
              {rule.assigned_priority}
            </Badge>
          </div>
        </div>
        
        {rule.description && (
          <p className="text-gray-600 mb-3 line-clamp-2">{rule.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>Order: {rule.execution_order}</span>
          <span>Matches: {rule.matched_count.toLocaleString()}</span>
          {rule.assigned_department && (
            <span>Dept: {rule.assigned_department.name}</span>
          )}
          {rule.assigned_user && (
            <span>Assignee: {rule.assigned_user.name}</span>
          )}
          {rule.last_matched_at && (
            <span>Last used: {new Date(rule.last_matched_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <Link href={`/admin/automation-rules/${rule.id}`}>
          <Button variant="ghost" size="sm" title="View rule">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/admin/automation-rules/${rule.id}/edit`}>
          <Button variant="ghost" size="sm" title="Edit rule">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-700"
          onClick={() => onDelete(rule.id)}
          title="Delete rule"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
));