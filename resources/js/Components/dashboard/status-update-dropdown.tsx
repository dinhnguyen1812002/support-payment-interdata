import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StatusUpdateDropdownProps {
  ticketId: number;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

const statusOptions = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

export function StatusUpdateDropdown({ 
  ticketId, 
  currentStatus, 
  onStatusUpdated 
}: StatusUpdateDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await router.post(`/admin/tickets/${ticketId}/status`, {
        status: newStatus
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Status updated to ${statusOptions.find(s => s.value === newStatus)?.label}`);
          onStatusUpdated?.();
        },
        onError: () => {
          toast.error('Failed to update status');
        }
      });
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusOption = statusOptions.find(s => s.value === currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-0"
          disabled={isUpdating}
        >
          <Badge 
            variant="outline" 
            className={`${currentStatusOption?.color} cursor-pointer hover:opacity-80 transition-opacity`}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            {currentStatusOption?.label || currentStatus}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleStatusUpdate(status.value)}
            className={currentStatus === status.value ? 'bg-muted' : ''}
          >
            <Badge 
              variant="outline" 
              className={`${status.color} mr-2`}
            >
              {status.label}
            </Badge>
            {currentStatus === status.value && (
              <span className="text-xs text-muted-foreground">(Current)</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
