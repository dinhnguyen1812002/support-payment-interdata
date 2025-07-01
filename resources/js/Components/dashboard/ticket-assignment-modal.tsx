import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
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
  Search, 
  User, 
  Users, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  Building,
  Star,
  CheckCircle
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path: string | null;
  department?: {
    id: number;
    name: string;
  };
  role?: string;
  workload?: number; // Number of assigned tickets
  performance_score?: number; // Performance rating
  availability?: 'available' | 'busy' | 'offline';
}

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

interface TicketAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Post[];
  users: User[];
  onAssignmentComplete?: () => void;
}

export function TicketAssignmentModal({ 
  isOpen, 
  onClose, 
  tickets, 
  users, 
  onAssignmentComplete 
}: TicketAssignmentModalProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [notifyAssignee, setNotifyAssignee] = useState(true);
  const [autoStatusUpdate, setAutoStatusUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setSearchTerm('');
      setAssignmentNote('');
      setNotifyAssignee(true);
      setAutoStatusUpdate(true);
      setFilterDepartment('all');
      setFilterAvailability('all');
    }
  }, [isOpen]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || 
                             (user.department && user.department.id.toString() === filterDepartment);
    const matchesAvailability = filterAvailability === 'all' || 
                               user.availability === filterAvailability;
    
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  // Get unique departments from users
  const uniqueDepartments = users
    .filter(u => u.department)
    .map(u => u.department!)
    .filter((dept, index, self) => 
      index === self.findIndex(d => d.id === dept.id)
    );

  // Calculate assignment recommendations
  const getUserRecommendationScore = (user: User) => {
    let score = 0;
    
    // Performance score (0-40 points)
    if (user.performance_score) {
      score += user.performance_score * 8; // Convert 5-star to 40 points
    }
    
    // Workload (0-30 points, inverse relationship)
    const workload = user.workload || 0;
    score += Math.max(0, 30 - workload * 2);
    
    // Availability (0-20 points)
    switch (user.availability) {
      case 'available': score += 20; break;
      case 'busy': score += 10; break;
      case 'offline': score += 0; break;
      default: score += 15;
    }
    
    // Department match (0-10 points)
    const ticketDepartments = tickets.map(t => t.department?.id).filter(Boolean);
    if (user.department && ticketDepartments.includes(user.department.id)) {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  // Sort users by recommendation score
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    return getUserRecommendationScore(b) - getUserRecommendationScore(a);
  });

  const handleAssignment = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await router.post('/admin/tickets/assign', {
        ticket_ids: tickets.map(t => t.id),
        assignee_id: selectedUser,
        note: assignmentNote,
        notify_assignee: notifyAssignee,
        auto_status_update: autoStatusUpdate
      });
      
      onAssignmentComplete?.();
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getAvailabilityIcon = (availability?: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <Clock className="h-3 w-3" />;
      case 'offline': return <User className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Tickets
          </DialogTitle>
          <DialogDescription>
            Assign {tickets.length} ticket{tickets.length > 1 ? 's' : ''} to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
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

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <div className="space-y-2 p-4">
              {sortedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members found</p>
                </div>
              ) : (
                sortedUsers.map((user) => {
                  const recommendationScore = getUserRecommendationScore(user);
                  const isSelected = selectedUser === user.id;
                  
                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_photo_path || ''} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{user.name}</h4>
                              {recommendationScore >= 80 && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              {user.department && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building className="h-3 w-3" />
                                  <span>{user.department.name}</span>
                                </div>
                              )}
                              
                              {user.availability && (
                                <Badge variant="outline" className={`text-xs ${getAvailabilityColor(user.availability)}`}>
                                  <span className="flex items-center gap-1">
                                    {getAvailabilityIcon(user.availability)}
                                    {user.availability}
                                  </span>
                                </Badge>
                              )}
                              
                              {user.workload !== undefined && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{user.workload} tickets</span>
                                </div>
                              )}
                              
                              {user.performance_score && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3" />
                                  <span>{user.performance_score.toFixed(1)}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {recommendationScore}% match
                          </div>
                          <div className="w-16 h-2 bg-muted rounded-full mt-1">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${recommendationScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Assignment Options */}
          {selectedUser && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="assignment-note">Assignment Note (Optional)</Label>
                <Textarea
                  id="assignment-note"
                  placeholder="Add a note for the assignee..."
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-assignee"
                    checked={notifyAssignee}
                    onCheckedChange={setNotifyAssignee}
                  />
                  <Label htmlFor="notify-assignee" className="text-sm">
                    Notify assignee via email
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-status"
                    checked={autoStatusUpdate}
                    onCheckedChange={setAutoStatusUpdate}
                  />
                  <Label htmlFor="auto-status" className="text-sm">
                    Update status to "In Progress"
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignment} 
            disabled={!selectedUser || isLoading}
          >
            {isLoading ? 'Assigning...' : `Assign ${tickets.length} Ticket${tickets.length > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
