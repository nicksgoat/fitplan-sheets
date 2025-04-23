
import React, { useState, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import ClubSidebar from './ClubSidebar';
import ClubHeader from './ClubHeader';
import ClubChat from './ClubChat';
import { ClubFeed } from './ClubFeed';
import ClubEvents from './ClubEvents';
import { ClubMembers } from './ClubMembers';
import { useNavigate } from 'react-router-dom';

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
    loadingMembers,
    refreshChannels,
    posts
  } = useClub();
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    console.log("[ClubLayout] Component mounted with clubId:", clubId);
    const isMember = isUserClubMember(clubId);
    console.log("[ClubLayout] Initial membership check:", isMember);
    
    const refreshData = async () => {
      try {
        console.log("[ClubLayout] Refreshing club data...");
        await Promise.all([
          refreshClubs(),
          refreshMembers(),
          refreshChannels()
        ]);
        
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
  
  useEffect(() => {
    if (!initialLoad && !loadingMembers && members.length === 0 && isUserClubMember(clubId)) {
      console.log("[ClubLayout] Members array is empty but user is a member, retrying refresh...");
      refreshMembers();
    }
  }, [initialLoad, loadingMembers, members.length, clubId, isUserClubMember]);
  
  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ClubChat />;
      case 'feed':
        return <ClubFeed posts={posts} />;
      case 'events':
        return <ClubEvents />;
      case 'members':
        return <ClubMembers />;
      default:
        return <ClubChat />;
    }
  };
  
  if (!currentClub) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex overflow-hidden">
      <ClubSidebar 
        clubId={clubId} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onBack={() => navigate('/clubs')}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <ClubHeader clubId={clubId} activeView={activeView} onBack={() => navigate('/clubs')} />
        <div className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ClubLayout;
