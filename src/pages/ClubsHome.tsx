
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import ClubsList from '@/components/clubs/ClubsList';
import EventsList from '@/components/clubs/EventsList';
import { Plus, Users as PeopleIcon, Calendar } from 'lucide-react';

const ClubsHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs, loadingClubs, refreshClubs } = useClub();
  const [activeTab, setActiveTab] = useState('clubs');
  
  useEffect(() => {
    refreshClubs();
  }, []);
  
  const handleCreateClub = () => {
    navigate('/clubs/create');
  };
  
  const handleCreateEvent = () => {
    navigate('/clubs/events/create');
  };
  
  return (
    <div className="container max-w-screen-lg mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {activeTab === 'clubs' ? 'Clubs' : 'Events'}
        </h1>
        <Button 
          onClick={activeTab === 'clubs' ? handleCreateClub : handleCreateEvent} 
          size="sm"
          className="rounded-full h-10 w-10 p-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs 
        defaultValue="clubs" 
        className="w-full" 
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="w-full bg-black border-b border-gray-800 p-0 h-auto rounded-none">
          <TabsTrigger 
            value="clubs" 
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500"
          >
            <PeopleIcon className="h-5 w-5 mr-2" />
            Clubs
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fitbloom-purple data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clubs" className="mt-4">
          <ClubsList />
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <EventsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubsHome;
