
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Club } from '@/types/club';

interface ClubMobileNavProps {
  club: Club;
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const ClubMobileNav: React.FC<ClubMobileNavProps> = ({ 
  club,
  activeTab,
  onChangeTab
}) => {
  const navigate = useNavigate();
  
  const navItems = [
    { id: 'feed', label: 'Feed' },
    { id: 'events', label: 'Events' },
    { id: 'channels', label: 'Channels' },
    { id: 'members', label: 'Members' },
    { id: 'shared', label: 'Shared' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2"
        onClick={() => navigate('/clubs')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center flex-1">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={club?.logo_url} />
          <AvatarFallback>
            {club?.name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-medium truncate">{club?.name}</h1>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="py-4">
            <h2 className="font-semibold text-lg mb-4">{club?.name}</h2>
            <nav className="space-y-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onChangeTab(item.id);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <Button
                variant="outline"
                className="w-full justify-start mt-4"
                onClick={() => navigate('/clubs')}
              >
                All Clubs
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClubMobileNav;
