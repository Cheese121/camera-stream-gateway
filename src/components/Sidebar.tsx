
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Grid2X2, 
  Camera, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  FileCog,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const NavItem = ({ icon: Icon, label, to }: { icon: any; label: string; to: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 mb-1',
            isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground',
            isCollapsed ? 'p-3' : 'px-4 py-2'
          )}
        >
          <Icon size={20} />
          {!isCollapsed && <span>{label}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "h-screen bg-sidebar relative flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[220px]",
        className
      )}
    >
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <Camera size={20} className="text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">Command Hub</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-sidebar-foreground" 
          onClick={toggleCollapsed}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>

      <div className="flex flex-col flex-1 p-2">
        <div className="space-y-1 py-2">
          <NavItem icon={Home} label="Overview" to="/" />
          <NavItem icon={Grid2X2} label="Live View" to="/dashboard" />
          <NavItem icon={Camera} label="Cameras" to="/cameras" />
          <NavItem icon={BarChart3} label="Analytics" to="/analytics" />
        </div>
        
        <Separator className="my-2 bg-sidebar-border" />
        
        <div className="space-y-1 py-2">
          <NavItem icon={FileCog} label="Integrations" to="/integrations" />
          <NavItem icon={Settings} label="Settings" to="/settings" />
        </div>
      </div>

      <div className="p-2 border-t border-sidebar-border">
        <div className="px-3 py-2 flex items-center gap-2">
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-xs font-medium text-sidebar-foreground">Command Hub</p>
              <p className="text-xs text-sidebar-foreground/60">v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
