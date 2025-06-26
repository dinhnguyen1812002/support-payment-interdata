
import { Category, Tag, Department, User } from '@/types';


export interface AutomationRule {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    categories: Category[];
    tags: Tag[];
    departments: Department[];
    users: User[];
    category_type: string;
    assigned_priority: string;
    execution_order: number;
    matched_count: number;
    last_matched_at: string | null;
    assigned_department?: {
      id: number;
      name: string;
    };
    assigned_user?: {
      id: number;
      name: string;
    };
  }
  
  export interface Stats {
    total_rules: number;
    active_rules: number;
    total_matches: number;
    recent_matches: number;
    top_rules: Array<{
      id: number;
      name: string;
      matched_count: number;
    }>;
  }
  
  export interface AutomationRulesProps {
    rules: {
      data: AutomationRule[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    stats: Stats;
    search: string;
  }