
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
        <TabsList className="grid grid-cols-5 bg-dark-300 rounded-t-lg rounded-b-none h-auto p-0 w-full">
          <TabsTrigger
            value="chats"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center justify-center gap-2 text-sm"
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </TabsTrigger>
          
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center justify-center gap-2 text-sm"
          >
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          
          <TabsTrigger
            value="memberships"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center justify-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            Memberships
          </TabsTrigger>
          
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center justify-center gap-2 text-sm"
          >
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          
          <TabsTrigger
            value="members"
            className="data-[state=active]:bg-dark-200 py-4 flex items-center justify-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chats" className="m-0 p-4">
          <ClubChat clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="events" className="m-0 p-4">
          <ClubEvents clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="memberships" className="m-0 p-4">
          {/* Add Memberships component if needed */}
          <div>Memberships content</div>
        </TabsContent>
        
        <TabsContent value="posts" className="m-0 p-4">
          <ClubFeed clubId={clubId} />
        </TabsContent>
        
        <TabsContent value="members" className="m-0 p-4">
          <ClubMembers clubId={clubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubTabs;
