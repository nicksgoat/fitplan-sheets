import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  Users,
  Hash,
  Info,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  Layers,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ClubDebugger from '@/components/debug/ClubDebugger';

interface ClubSidebarProps {
  clubId: string;
  activeView: string;
  setActiveView: (view: 'chat' | 'feed' | 'events' | 'members') => void;
  onBack?: () => void;
}

const ClubSidebar: React.FC<ClubSidebarProps> = ({ 
  clubId, 
  activeView, 
  setActiveView,
  onBack
}) => {
  const { 
    currentClub, 
    isUserClubMember, 
    isUserClubAdmin, 
    leaveCurrentClub,
    joinCurrentClub,
    refreshClubs,
    refreshMembers,
    userClubs
  } = useClub();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  
  if (!currentClub) return null;
  
  const isMember = isUserClubMember(clubId);
  console.log(`[ClubSidebar] ClubId: ${clubId}, User: ${user?.id}, isMember: ${isMember}`);
  console.log(`[ClubSidebar] UserClubs: `, userClubs);
  
  const isAdmin = isUserClubAdmin(clubId);
  
  const handleLeaveClick = async () => {
    try {
      await leaveCurrentClub();
      navigate('/clubs');
    } catch (error) {
      console.error('Error leaving club:', error);
    }
  };
  
  const handleJoinClick = async () => {
    if (!user) {
      toast.error('You need to log in to join this club');
      navigate('/auth');
      return;
    }
    
    try {
      console.log("[ClubSidebar] Starting join process");
      setJoining(true);
      toast.loading('Joining club...');
      
      console.log("[ClubSidebar] Joining club:", clubId);
      console.log("[ClubSidebar] Current user:", user.id);
      console.log("[ClubSidebar] Current userClubs:", userClubs);
      
      const membership = await joinCurrentClub();
      toast.dismiss();
      toast.success(`You've joined ${currentClub.name}`);
      
      console.log("[ClubSidebar] Join result:", membership);
      
      console.log("[ClubSidebar] Join completed, refreshing data...");
      await Promise.all([
        refreshClubs(),
        refreshMembers()
      ]);
      
      console.log("[ClubSidebar] Data refreshed, checking membership status...");
      const newIsMember = isUserClubMember(clubId);
      console.log("[ClubSidebar] After join, isMember:", newIsMember);
      
      if (!newIsMember) {
        console.log("[ClubSidebar] Membership still not showing up, forcing page reload");
        window.location.reload();
      }
    } catch (error) {
      console.error('[ClubSidebar] Error joining club:', error);
      toast.dismiss();
      toast.error('Failed to join club. Please try again.');
    } finally {
      setJoining(false);
    }
  };
  
  const NavItem = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    disabled = false 
  }: { 
    icon: React.ElementType; 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    disabled?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "flex items-center w-full px-2 py-2 text-left rounded-md text-sm mb-1 transition-all",
              active 
                ? "bg-dark-300 text-white" 
                : "text-gray-400 hover:bg-dark-300/50 hover:text-gray-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            <span>{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dark-300 text-white border-dark-400">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  return (
    <div className="w-56 lg:w-64 bg-dark-300 flex flex-col border-r border-dark-400">
      <div className="p-4 border-b border-dark-400">
        <div className="flex items-center space-x-2">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white hover:bg-dark-400 p-1 h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={currentClub.logo_url || undefined} 
              alt={currentClub.name} 
            />
            <AvatarFallback className="bg-fitbloom-purple">
              {currentClub.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <h3 className="font-semibold truncate">{currentClub.name}</h3>
          </div>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setActiveView('members')}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Main</h4>
            </div>
            
            <NavItem 
              icon={Info} 
              label="About" 
              active={false} 
              onClick={() => {}}
            />
            
            <NavItem 
              icon={FileText} 
              label="Feed" 
              active={activeView === 'feed'} 
              onClick={() => setActiveView('feed')}
            />
            
            <NavItem 
              icon={Calendar} 
              label="Events" 
              active={activeView === 'events'} 
              onClick={() => setActiveView('events')}
            />
            
            <NavItem 
              icon={Users} 
              label="Members" 
              active={activeView === 'members'} 
              onClick={() => setActiveView('members')}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Channels</h4>
              {isAdmin && (
                <button className="text-gray-400 hover:text-white">
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <NavItem 
              icon={Hash} 
              label="general" 
              active={activeView === 'chat'} 
              onClick={() => setActiveView('chat')}
              disabled={!isMember}
            />
            
            <NavItem 
              icon={Hash} 
              label="announcements" 
              active={false} 
              onClick={() => {}}
              disabled={!isMember}
            />
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-dark-400 bg-dark-400">
        {isMember ? (
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-dark-300 w-full justify-start"
              onClick={handleLeaveClick}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
            
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-300 hover:bg-dark-300"
                onClick={() => {}}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <Button 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90 w-full"
            size="sm"
            onClick={handleJoinClick}
            disabled={joining}
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Club'
            )}
          </Button>
        )}
      </div>

      {import.meta.env.DEV && (
        <ClubDebugger clubId={clubId} />
      )}
    </div>
  );
};

export default ClubSidebar;
