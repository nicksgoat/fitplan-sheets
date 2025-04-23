
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { BarChart2, Calendar, FolderHeart, Heart, Home, Layout, PlusCircle, Search, Settings, User, Users, LineChart, Dumbbell } from 'lucide-react';

export default function Sidebar() {
  const { session } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:block w-64 border-r border-gray-800 h-screen sticky top-0 overflow-y-auto pb-12">
      <div className="py-4 px-3">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-fitbloom-purple">FitBloom</span>
        </Link>

        <nav className="space-y-1">
          <Link to="/explore">
            <Button
              variant={isActive('/explore') ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive('/explore') && 'bg-gray-800')}
            >
              <Home className="mr-2 h-5 w-5" />
              Explore
            </Button>
          </Link>
          <Link to="/search">
            <Button
              variant={isActive('/search') ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive('/search') && 'bg-gray-800')}
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </Link>
          
          {/* New features */}
          <Link to="/ai-workout-generator">
            <Button
              variant={isActive('/ai-workout-generator') ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive('/ai-workout-generator') && 'bg-gray-800')}
            >
              <Dumbbell className="mr-2 h-5 w-5" />
              AI Workout Generator
            </Button>
          </Link>
          <Link to="/analytics">
            <Button
              variant={isActive('/analytics') ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start', isActive('/analytics') && 'bg-gray-800')}
            >
              <LineChart className="mr-2 h-5 w-5" />
              Analytics
            </Button>
          </Link>
          
          {session && (
            <>
              <Link to="/library">
                <Button
                  variant={isActive('/library') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/library') && 'bg-gray-800')}
                >
                  <FolderHeart className="mr-2 h-5 w-5" />
                  Library
                </Button>
              </Link>
              <Link to="/schedule">
                <Button
                  variant={isActive('/schedule') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/schedule') && 'bg-gray-800')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule
                </Button>
              </Link>
              <Link to="/clubs">
                <Button
                  variant={isActive('/clubs') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/clubs') && 'bg-gray-800')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Clubs
                </Button>
              </Link>
              <Link to="/liked">
                <Button
                  variant={isActive('/liked') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/liked') && 'bg-gray-800')}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Liked
                </Button>
              </Link>
              <Link to="/sheets">
                <Button
                  variant={isActive('/sheets') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/sheets') && 'bg-gray-800')}
                >
                  <Layout className="mr-2 h-5 w-5" />
                  Sheets
                </Button>
              </Link>
              <Link to="/leaderboards">
                <Button
                  variant={isActive('/leaderboards') ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start', isActive('/leaderboards') && 'bg-gray-800')}
                >
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Leaderboards
                </Button>
              </Link>
            </>
          )}

          <div className="pt-4">
            {session ? (
              <>
                <Link to="/profile/view">
                  <Button
                    variant={isActive('/profile/view') ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start', isActive('/profile/view') && 'bg-gray-800')}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                <Link to="/creator">
                  <Button
                    variant={isActive('/creator') ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start', isActive('/creator') && 'bg-gray-800')}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Creator Dashboard
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant={isActive('/settings') ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start', isActive('/settings') && 'bg-gray-800')}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
