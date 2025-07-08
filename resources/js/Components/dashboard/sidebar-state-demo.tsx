import React from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { useSidebar } from '@/Components/ui/sidebar';
import { useSidebarItemsState } from '@/Hooks/use-sidebar-state';
import { Settings, Info, RotateCcw } from 'lucide-react';

export function SidebarStateDemo() {
  const { open, toggleSidebar, state } = useSidebar();
  const { itemsState, setItemState } = useSidebarItemsState();

  const clearAllStates = () => {
    // Clear localStorage
    localStorage.removeItem('sidebar-state');
    localStorage.removeItem('sidebar-items-state');
    
    // Reset all items to closed
    Object.keys(itemsState).forEach(key => {
      setItemState(key, false);
    });
    
    // Reload page to reset state
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Sidebar State Demo
        </CardTitle>
        <CardDescription>
          Test sidebar state persistence across page navigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sidebar State:</span>
            <Badge variant={open ? "default" : "secondary"}>
              {state}
            </Badge>
          </div>
          
          <Button 
            onClick={toggleSidebar} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Toggle Sidebar
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Collapsible Items State:</div>
          <div className="space-y-1 text-xs">
            {Object.entries(itemsState).map(([key, isOpen]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key.replace(/-/g, ' ')}:</span>
                <Badge variant={isOpen ? "default" : "secondary"} className="text-xs">
                  {isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button 
            onClick={clearAllStates} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All States
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <p>State is automatically saved to localStorage and persists across:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Page navigation</li>
                <li>Browser refresh</li>
                <li>Tab close/reopen</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
