
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import ClubSidebar from './ClubSidebar';
import ClubHeader from './ClubHeader';
import ClubChat from './ClubChat';
import ClubFeed from './ClubFeed';
import ClubEvents from './ClubEvents';
import ClubMembers from './ClubMembers';
import { useNavigate } from 'react-router-dom';

interface ClubLayoutProps {
  clubId: string;
}

type ActiveView = 'chat' | 'feed' | 'events' | 'members';

const ClubLayout: React.FC<ClubLayoutProps> = ({ clubId }) => {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const { currentClub } = useClub();
  const navigate = useNavigate();
  
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
      </div>
    </div>
  );
};

export default ClubLayout;
