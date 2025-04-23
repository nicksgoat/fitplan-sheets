
import React from 'react';
import { Club } from '@/types/club';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    { id: 'shared', label: 'Shared Content' },
  ];

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-dark-200 sticky top-0 z-10 border-b border-dark-300">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/clubs')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold truncate max-w-[200px]">{club.name}</h1>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-dark-200 border-dark-300 p-0">
          <SheetHeader className="p-4 border-b border-dark-300">
            <SheetTitle className="text-left">{club.name}</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/clubs')}
              className="w-full justify-start mb-4"
            >
              <Home className="mr-2 h-4 w-4" /> 
              All Clubs
            </Button>
            
            <div className="space-y-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onChangeTab(item.id);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClubMobileNav;
