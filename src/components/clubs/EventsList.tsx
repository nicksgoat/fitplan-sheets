
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '@/contexts/ClubContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import EventCard from '@/components/clubs/EventCard';

const categories = [
  'All',
  'Group Workout',
  'Yoga',
  'Running',
  'Strength Training',
  'Calisthenics',
  'Cycling',
  'Swimming',
];

const EventsList = () => {
  const navigate = useNavigate();
  const { userClubs, clubEvents, loadClubEvents, loadingClubEvents } = useClub();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    if (userClubs.length > 0 && !selectedClubId) {
      setSelectedClubId(userClubs[0].id);
    }
  }, [userClubs]);
  
  useEffect(() => {
    if (selectedClubId) {
      loadClubEvents(selectedClubId);
    }
  }, [selectedClubId]);
  
  const handleClubChange = (clubId: string) => {
    setSelectedClubId(clubId);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/clubs/events/${eventId}`);
  };
  
  const handleCreateEvent = () => {
    if (!selectedClubId) {
      return;
    }
    navigate(`/clubs/events/create?clubId=${selectedClubId}`);
  };
  
  const filteredEvents = selectedCategory === 'All'
    ? clubEvents
    : clubEvents.filter(event => event.category === selectedCategory);
  
  if (userClubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-16 w-16 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">You're not a member of any clubs</h3>
        <p className="text-gray-500 mb-6">Join a club to see and create events</p>
        <Button onClick={() => navigate('/clubs')}>Explore Clubs</Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Club selector */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-2">Select Club:</h3>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {userClubs.map((club) => (
            <Button
              key={club.id}
              variant={selectedClubId === club.id ? "default" : "outline"}
              className={`rounded-full ${selectedClubId === club.id ? '' : 'text-white'}`}
              onClick={() => handleClubChange(club.id)}
            >
              {club.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-full ${selectedCategory === category ? '' : 'text-white'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Events list */}
      {loadingClubEvents ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <Skeleton className="h-40 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {selectedClubId ? 'No events found for this club' : 'Please select a club to view events'}
          </h3>
          {selectedClubId && (
            <>
              <p className="text-gray-500 mb-6">Create your first event!</p>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onClick={() => handleEventClick(event.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
