import React from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { useNavigation, useActiveRoute } from '@/Hooks/use-navigation';
import { NavigationSpinner } from '@/Components/ui/navigation-progress';
import { Link } from '@inertiajs/react';
import { 
  ArrowRight, 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Activity,
  ExternalLink 
} from 'lucide-react';

export function NavigationDemo() {
  const { isNavigating, currentUrl, navigate } = useNavigation();
  const { isActive } = useActiveRoute();

  const demoRoutes = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/posts', label: 'Posts', icon: FileText },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Navigation Demo
          {isNavigating && <NavigationSpinner />}
        </CardTitle>
        <CardDescription>
          Test SPA navigation without page reload
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current URL:</span>
            <Badge variant="outline" className="text-xs">
              {currentUrl}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Navigation State:</span>
            <Badge variant={isNavigating ? "default" : "secondary"}>
              {isNavigating ? "Navigating..." : "Idle"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Quick Navigation:</div>
          <div className="grid grid-cols-2 gap-2">
            {demoRoutes.map((route) => {
              const Icon = route.icon;
              const active = isActive(route.path, true);
              
              return (
                <Button
                  key={route.path}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => navigate(route.path)}
                  disabled={isNavigating}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {route.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Test Links:</div>
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ArrowRight className="h-3 w-3" />
              Go to Dashboard (Inertia Link)
            </Link>
            
            <Link 
              href="/departments" 
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ArrowRight className="h-3 w-3" />
              Go to Departments (Inertia Link)
            </Link>
            
            <a 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Go to Dashboard (Regular Link - Will Reload)
            </a>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>No page reload when using Inertia Links</li>
            <li>Sidebar state persists across navigation</li>
            <li>Progress bar shows navigation status</li>
            <li>Active route detection</li>
            <li>Loading states for better UX</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
