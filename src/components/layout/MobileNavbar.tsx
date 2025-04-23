
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Home, Search, FolderHeart, Dumbbell, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function MobileNavbar() {
  const location = useLocation();
  const { session } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900/90 backdrop-blur-md z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/explore"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 py-2 text-xs",
            isActive("/explore")
              ? "text-fitbloom-purple"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Home</span>
        </Link>
        <Link
          to="/search"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 py-2 text-xs",
            isActive("/search")
              ? "text-fitbloom-purple"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          <Search className="h-5 w-5 mb-1" />
          <span>Search</span>
        </Link>
        <Link
          to="/ai-workout-generator"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 py-2 text-xs",
            isActive("/ai-workout-generator")
              ? "text-fitbloom-purple"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          <Dumbbell className="h-5 w-5 mb-1" />
          <span>AI Workout</span>
        </Link>
        <Link
          to="/analytics"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 py-2 text-xs",
            isActive("/analytics")
              ? "text-fitbloom-purple"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          <LineChart className="h-5 w-5 mb-1" />
          <span>Stats</span>
        </Link>
        <Link
          to={session ? "/profile/view" : "/auth"}
          className={cn(
            "flex flex-col items-center justify-center w-1/5 py-2 text-xs",
            isActive("/profile/view") || isActive("/auth")
              ? "text-fitbloom-purple"
              : "text-gray-400 hover:text-gray-300"
          )}
        >
          <User className="h-5 w-5 mb-1" />
          <span>{session ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );
}
