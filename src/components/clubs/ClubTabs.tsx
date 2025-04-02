import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClub } from '@/contexts/ClubContext';
import ClubChat from './ClubChat';
import ClubFeed from './ClubFeed';
import ClubEvents from './ClubEvents';
import ClubMembers from './ClubMembers';
import { MessageSquare, FileText, Calendar, Users } from 'lucide-react';

interface ClubTabsProps {
  clubId: string;
}

const ClubTabs: React.FC<ClubTabsProps> = ({ clubId }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const { isUserClubMember } = useClub();
  
  const isMember = isUserClubMember(clubId);
  
  return (
    <div className="bg-dark-200 rounded-lg p-0 mt-4">
      <Tabs 
        defaultValue="feed" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 bg-dark-300 rounded-t-lg rounded-b-none h-auto p-0">
          <TabsTrigger
            value="feed"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center gap-2"
            disabled={!isMember}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="m-0 p-4">
          <ClubFeed clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="events" className="m-0 p-4">
          <ClubEvents clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="members" className="m-0 p-4">
          <ClubMembers clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="chat" className="m-0">
          {isMember ? (
            <ClubChat clubId={clubId} />
          ) : (
            <div className="p-4 text-center text-gray-400">
              You need to join this club to access the chat.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubTabs;
