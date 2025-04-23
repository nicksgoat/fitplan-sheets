
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus, ExternalLink, Users, MapPin, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClubEvent, EventParticipant, EventParticipationStatus } from '@/types/club';

interface ClubEventsProps {
  clubId: string;
}

const ClubEvents: React.FC<ClubEventsProps> = ({ clubId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching events from an API
        const mockEvents: ClubEvent[] = [
          {
            id: '1',
            club_id: clubId,
            name: 'Monthly Meetup',
            description: 'Join us for our monthly meetup!',
            location: 'Online',
            start_time: '2024-08-15T18:00:00',
            end_time: '2024-08-15T20:00:00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            image_url: 'https://via.placeholder.com/300',
          },
          {
            id: '2',
            club_id: clubId,
            name: 'Workshop',
            description: 'Learn new skills in our workshop.',
            location: 'In-person',
            start_time: '2024-09-20T10:00:00',
            end_time: '2024-09-20T16:00:00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            image_url: 'https://via.placeholder.com/300',
          },
        ];
        setEvents(mockEvents);

        // Simulate fetching participants for the first event
        const mockParticipants: EventParticipant[] = [
          {
            id: '1',
            event_id: '1',
            user_id: 'user1',
            status: 'going',
            joined_at: new Date().toISOString(),
            profile: {
              display_name: 'John Doe',
              username: 'johndoe',
              avatar_url: 'https://via.placeholder.com/50',
            },
          },
          {
            id: '2',
            event_id: '1',
            user_id: 'user2',
            status: 'interested',
            joined_at: new Date().toISOString(),
            profile: {
              display_name: 'Jane Smith',
              username: 'janesmith',
              avatar_url: 'https://via.placeholder.com/50',
            },
          },
        ];
        setParticipants(mockParticipants);

        // Simulate checking admin and member status
        setIsAdmin(true);
        setIsMember(true);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [clubId]);

  const openEventDetails = (event: ClubEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const openParticipantDetails = (event: ClubEvent) => {
    setSelectedEvent(event);
    setIsParticipantDialogOpen(true);
  };

  const updateParticipantStatus = (participantId: string, eventId: string, status: EventParticipationStatus) => {
    // Simulate updating participant status
    console.log(`Updating participant ${participantId} status to ${status} for event ${eventId}`);
  };

  // Add the missing handleParticipantStatusChange function
  const handleParticipantStatusChange = (participant: EventParticipant, newStatus: EventParticipationStatus) => {
    // Here you would typically update the participant status in the database
    console.log(`Changing ${participant.profile?.display_name}'s status to ${newStatus}`);
    
    // For this example, let's just update the status locally
    setParticipants(prevParticipants => 
      prevParticipants.map(p => 
        p.id === participant.id ? { ...p, status: newStatus } : p
      )
    );
    
    // Call the API function to update the status
    updateParticipantStatus(participant.id, participant.event_id, newStatus);
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        {isAdmin && (
          <Button onClick={() => navigate('/events/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-400">No upcoming events scheduled</p>
          {isAdmin && (
            <Button onClick={() => navigate('/events/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
              onClick={() => openEventDetails(event)}
            >
              {event.image_url && (
                <div
                  className="h-32 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.image_url})` }}
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-gray-500 text-sm">{event.description}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(event.start_time), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center mt-1 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">{selectedEvent?.description}</p>
            <div className="flex items-center mt-2 text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(new Date(selectedEvent?.start_time || ''), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center mt-1 text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{selectedEvent?.location}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            {isMember && (
              <Button onClick={() => openParticipantDetails(selectedEvent as ClubEvent)}>
                View Participants
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Participants Dialog */}
      <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Event Participants</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {participants.length === 0 ? (
              <p className="text-gray-500">No participants yet.</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {participants.map((participant) => (
                  <div key={participant.id} className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={participant.profile?.avatar_url || undefined} />
                        <AvatarFallback>{participant.profile?.display_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{participant.profile?.display_name || 'User'}</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Badge 
                            variant={participant.status === 'going' ? 'default' : 
                              participant.status === 'interested' ? 'secondary' : 'outline'}>
                            {participant.status === 'going' ? 'Going' : 
                             participant.status === 'interested' ? 'Interested' : 'Not Going'}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      {isAdmin && (
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleParticipantStatusChange(participant, 'going')}>
                            Mark as Going
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleParticipantStatusChange(participant, 'interested')}>
                            Mark as Interested
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleParticipantStatusChange(participant, 'not_going')}>
                            Mark as Not Going
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsParticipantDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubEvents;
