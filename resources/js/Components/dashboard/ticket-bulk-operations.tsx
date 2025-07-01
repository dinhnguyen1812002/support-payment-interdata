import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
  Settings, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Tag,
  Archive,
  Trash2,
  Copy,
  Move,
  Building
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface Post {
  id: number;
  title: string;
  status: string;
  priority: string;
  department?: {
    id: number;
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
}

interface TicketBulkOperationsProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Post[];
  departments: Department[];
  onOperationComplete?: () => void;
}

type BulkOperation = 
  | 'status'
  | 'priority' 
  | 'department'
  | 'archive'
  | 'delete'
  | 'duplicate'
  | 'add_tags'
  | 'close_resolved';

export function TicketBulkOperations({ 
  isOpen, 
  onClose, 
  tickets, 
  departments,
  onOperationComplete 
}: TicketBulkOperationsProps) {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | ''>('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [tags, setTags] = useState('');
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const operations = [
    {
      id: 'status' as BulkOperation,
      label: 'Update Status',
      description: 'Change the status of selected tickets',
      icon: Settings,
      color: 'text-blue-600'
    },
    {
      id: 'priority' as BulkOperation,
      label: 'Update Priority',
      description: 'Change the priority level of selected tickets',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 'department' as BulkOperation,
      label: 'Transfer Department',
      description: 'Move tickets to a different department',
      icon: Building,
      color: 'text-green-600'
    },
    {
      id: 'close_resolved' as BulkOperation,
      label: 'Close Resolved Tickets',
      description: 'Automatically close all resolved tickets',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'add_tags' as BulkOperation,
      label: 'Add Tags',
      description: 'Add tags to selected tickets for better organization',
      icon: Tag,
      color: 'text-purple-600'
    },
    {
      id: 'duplicate' as BulkOperation,
      label: 'Duplicate Tickets',
      description: 'Create copies of selected tickets',
      icon: Copy,
      color: 'text-indigo-600'
    },
    {
      id: 'archive' as BulkOperation,
      label: 'Archive Tickets',
      description: 'Archive selected tickets (can be restored later)',
      icon: Archive,
      color: 'text-gray-600'
    },
    {
      id: 'delete' as BulkOperation,
      label: 'Delete Tickets',
      description: 'Permanently delete selected tickets (cannot be undone)',
      icon: Trash2,
      color: 'text-red-600'
    }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-yellow-600' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
    { value: 'closed', label: 'Closed', icon: XCircle, color: 'text-gray-600' }
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
  ];

  const handleOperation = async () => {
    if (!selectedOperation) return;
    
    setIsLoading(true);
    try {
      const baseData = {
        ticket_ids: tickets.map(t => t.id),
        reason: reason,
        send_notification: sendNotification
      };

      let endpoint = '';
      let data = { ...baseData };

      switch (selectedOperation) {
        case 'status':
          endpoint = '/admin/tickets/bulk-status';
          data = { ...baseData, status: newStatus };
          break;
        case 'priority':
          endpoint = '/admin/tickets/bulk-priority';
          data = { ...baseData, priority: newPriority };
          break;
        case 'department':
          endpoint = '/admin/tickets/bulk-department';
          data = { ...baseData, department_id: newDepartment };
          break;
        case 'close_resolved':
          endpoint = '/admin/tickets/bulk-close-resolved';
          break;
        case 'add_tags':
          endpoint = '/admin/tickets/bulk-add-tags';
          data = { ...baseData, tags: tags.split(',').map(t => t.trim()).filter(Boolean) };
          break;
        case 'duplicate':
          endpoint = '/admin/tickets/bulk-duplicate';
          break;
        case 'archive':
          endpoint = '/admin/tickets/bulk-archive';
          break;
        case 'delete':
          endpoint = '/admin/tickets/bulk-delete';
          break;
      }

      await router.post(endpoint, data);
      onOperationComplete?.();
      onClose();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedOperation('');
    setNewStatus('');
    setNewPriority('');
    setNewDepartment('');
    setTags('');
    setReason('');
    setSendNotification(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    if (!selectedOperation) return false;
    
    switch (selectedOperation) {
      case 'status':
        return !!newStatus;
      case 'priority':
        return !!newPriority;
      case 'department':
        return !!newDepartment;
      case 'add_tags':
        return !!tags.trim();
      case 'close_resolved':
      case 'duplicate':
      case 'archive':
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  const getOperationWarning = () => {
    switch (selectedOperation) {
      case 'delete':
        return 'This action cannot be undone. Deleted tickets will be permanently removed.';
      case 'archive':
        return 'Archived tickets will be hidden from the main view but can be restored later.';
      case 'duplicate':
        return 'This will create exact copies of the selected tickets with new IDs.';
      case 'close_resolved':
        return 'This will automatically close all tickets that are currently marked as resolved.';
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bulk Operations
          </DialogTitle>
          <DialogDescription>
            Perform bulk actions on {tickets.length} selected ticket{tickets.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Selected Tickets:</h4>
            <div className="flex flex-wrap gap-2">
              {tickets.slice(0, 3).map(ticket => (
                <Badge key={ticket.id} variant="outline" className="text-xs">
                  {ticket.title.length > 30 ? `${ticket.title.substring(0, 30)}...` : ticket.title}
                </Badge>
              ))}
              {tickets.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tickets.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Operation Selection */}
          <div>
            <Label className="text-base font-medium">Select Operation</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {operations.map((operation) => {
                const Icon = operation.icon;
                const isSelected = selectedOperation === operation.id;
                
                return (
                  <div
                    key={operation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedOperation(operation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${operation.color}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{operation.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {operation.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operation-specific Options */}
          {selectedOperation && (
            <div className="space-y-4 border-t pt-4">
              {selectedOperation === 'status' && (
                <div>
                  <Label htmlFor="new-status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${option.color}`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedOperation === 'priority' && (
                <div>
                  <Label htmlFor="new-priority">New Priority</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select new priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className={option.color}>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedOperation === 'department' && (
                <div>
                  <Label htmlFor="new-department">Target Department</Label>
                  <Select value={newDepartment} onValueChange={setNewDepartment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedOperation === 'add_tags' && (
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Textarea
                    id="tags"
                    placeholder="urgent, customer-complaint, billing..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Reason field for most operations */}
              {!['duplicate', 'add_tags'].includes(selectedOperation) && (
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this bulk operation is being performed..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Notification option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-notification"
                  checked={sendNotification}
                  onCheckedChange={setSendNotification}
                />
                <Label htmlFor="send-notification" className="text-sm">
                  Send notifications to affected users
                </Label>
              </div>

              {/* Warning message */}
              {getOperationWarning() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      {getOperationWarning()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleOperation} 
            disabled={!isFormValid() || isLoading}
            variant={selectedOperation === 'delete' ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : `Apply to ${tickets.length} Ticket${tickets.length > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
