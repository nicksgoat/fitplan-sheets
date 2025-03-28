
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Library, Compass, Heart, User, Home, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  mobileFooter?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ 
  mobileFooter = false, 
  collapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { name: 'Home', path: '/explore', icon: <Home className="h-5 w-5" /> },
    { name: 'Search', path: '/search', icon: <Search className="h-5 w-5" /> },
    { name: 'My Library', path: '/library', icon: <Library className="h-5 w-5" /> },
    { name: 'Liked', path: '/liked', icon: <Heart className="h-5 w-5" /> },
    { name: 'Sheets', path: '/sheets', icon: <FileSpreadsheet className="h-5 w-5" /> },
  ];

  if (mobileFooter) {
    return (
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                location.pathname === item.path ? "text-fitbloom-purple" : "text-gray-400"
              )}
            >
              {item.icon}
            </Button>
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-black h-full flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-6",
        collapsed && "p-4 flex justify-center"
      )}>
        {!collapsed ? (
          <h1 className="text-2xl font-bold flex items-center">
            <span className="text-fitbloom-purple">Fit</span>
            <span className="text-white">Bloom</span>
          </h1>
        ) : (
          <span className="text-2xl font-bold text-fitbloom-purple">F</span>
        )}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-gray-900 hover:text-white",
                    location.pathname === item.path && "bg-gray-900 text-fitbloom-purple font-medium",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={cn(
        "p-6",
        collapsed && "p-4"
      )}>
        {!collapsed ? (
          <Link to="/profile">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-900">
              <User className="h-5 w-5" />
              <span className="ml-3">Profile</span>
            </Button>
          </Link>
        ) : (
          <Link to="/profile">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-white hover:bg-gray-900"
              title="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>
      {onToggleCollapse && (
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            onClick={onToggleCollapse} 
            className="w-full justify-center text-gray-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
