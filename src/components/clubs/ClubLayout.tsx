
import React, { useState, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import ClubSidebar from './ClubSidebar';
import ClubHeader from './ClubHeader';
import ClubChat from './ClubChat';
import ClubFeed from './ClubFeed';
import ClubEvents from './ClubEvents';
import ClubMembers from './ClubMembers';
import { useNavigate } from 'react-router-dom';
import ClubDebugger from '@/components/debug/ClubDebugger';

interface ClubLayoutProps {
  clubId: string;
}

type ActiveView = 'chat' | 'feed' | 'events' | 'members';

const ClubLayout: React.FC<ClubLayoutProps> = ({ clubId }) => {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const { 
    currentClub, 
    refreshClubs, 
    refreshMembers, 
    isUserClubMember, 
    members,
    loadingMembers
  } = useClub();
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Enhanced logging
  useEffect(() => {
    console.log("[ClubLayout] Component mounted with clubId:", clubId);
    const isMember = isUserClubMember(clubId);
    console.log("[ClubLayout] Initial membership check:", isMember);
    
    // Refresh membership info when the component loads
    const refreshData = async () => {
      try {
        console.log("[ClubLayout] Refreshing club data...");
        await Promise.all([
          refreshClubs(),
          refreshMembers()
        ]);
        
        // Check membership after refresh
        const isMemberAfterRefresh = isUserClubMember(clubId);
        console.log("[ClubLayout] Membership after refresh:", isMemberAfterRefresh);
        console.log("[ClubLayout] Members after refresh:", members);
        setInitialLoad(false);
      } catch (error) {
        console.error('[ClubLayout] Error refreshing club data:', error);
        setInitialLoad(false);
      }
    };
    
    refreshData();
  }, [clubId]);
  
  // Add a secondary effect to check if members is empty after loading
  useEffect(() => {
    if (!initialLoad && !loadingMembers && members.length === 0 && isUserClubMember(clubId)) {
      console.log("[ClubLayout] Members array is empty but user is a member, retrying refresh...");
      refreshMembers();
    }
  }, [initialLoad, loadingMembers, members.length, clubId, isUserClubMember]);
  
  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ClubChat clubId={clubId} />;
      case 'feed':
        return <ClubFeed clubId={clubId} />;
      case 'events':
        return <ClubEvents clubId={clubId} />;
      case 'members':
        return <ClubMembers clubId={clubId} />;
      default:
        return <ClubChat clubId={clubId} />;
    }
  };
  
  if (!currentClub) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex overflow-hidden">
      {/* Sidebar */}
      <ClubSidebar 
        clubId={clubId} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onBack={() => navigate('/clubs')}
      />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ClubHeader clubId={clubId} activeView={activeView} onBack={() => navigate('/clubs')} />
        <div className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </div>
        
        {/* Debug panel for development */}
        {import.meta.env.DEV && (
          <div className="border-t border-dark-400">
            <ClubDebugger clubId={clubId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubLayout;
