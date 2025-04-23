
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClub } from '@/contexts/ClubContext';
import { EventParticipationStatus } from '@/types/club';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Check, X } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils'; // Changed from formatTimestamp to formatTime
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const ClubEvents = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    events, 
    loadingEvents, 
    joinEvent, 
    isUserEventParticipant,
    leaveEvent 
  } = useClub();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<EventParticipationStatus>('going');

  useEffect(() => {
    if (selectedEvent && events.length > 0) {
      // Check if user is already a participant and set status
      const isParticipant = isUserEventParticipant(selectedEvent);
      if (isParticipant) {
        const event = events.find(e => e.id === selectedEvent);
        // In a real implementation, you'd find the user's status
        setCurrentStatus('going');
      } else {
        setCurrentStatus('going');
      }
    }
  }, [selectedEvent, events]);

  const handleParticipantStatusChange = async (eventId: string, status: EventParticipationStatus) => {
    try {
      await joinEvent(eventId, status);
      setCurrentStatus(status);
      toast.success(`You are now ${status === 'going' ? 'attending' : status === 'interested' ? 'interested in' : 'not attending'} this event`);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update your status for this event');
    }
  };

  const handleJoin = async (eventId: string) => {
    try {
      await joinEvent(eventId, currentStatus);
      toast.success(`You are ${currentStatus === 'going' ? 'now attending' : currentStatus === 'interested' ? 'interested in' : 'not attending'} this event`);
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleLeave = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
      toast.success('You have left the event');
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  };

  const handleViewDetails = (eventId: string) => {
    navigate(`/clubs/${id}/events/${eventId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <Button onClick={() => navigate(`/clubs/${id}/create-event`)}>
          Create Event
        </Button>
      </div>

      {loadingEvents ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No upcoming events</p>
          <Button onClick={() => navigate(`/clubs/${id}/create-event`)}>
            Create the First Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.image_url && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span className="ml-1">
                    {formatTime(event.start_time)} {/* Using formatTime instead of formatTimestamp */}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.description && (
                  <p className="line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  <span>
                    {format(new Date(event.start_time), 'h:mm a')} - 
                    {format(new Date(event.end_time), 'h:mm a')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users size={14} className="mr-1" />
                  <span>{event.attendee_count || 0} attending</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                {isUserEventParticipant(event.id) ? (
                  <>
                    <Button size="sm" onClick={() => setSelectedEvent(event.id)} variant="outline" className="flex-1">
                      <Check size={16} className="mr-1" />
                      Going
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleLeave(event.id)} 
                      className="flex-1"
                    >
                      <X size={16} className="mr-1" />
                      Leave
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleJoin(event.id)} 
                      className="flex-1"
                    >
                      Join
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDetails(event.id)} 
                      className="flex-1"
                    >
                      Details
                    </Button>
                  </>
                )}
              </CardFooter>
              
              {/* Status selection dialog if event is selected */}
              {selectedEvent === event.id && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Your status:</h4>
                  <RadioGroup 
                    value={currentStatus} 
                    onValueChange={(val) => handleParticipantStatusChange(event.id, val as EventParticipationStatus)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="going" id="going" />
                      <Label htmlFor="going">Going</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="interested" id="interested" />
                      <Label htmlFor="interested">Interested</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_going" id="not_going" />
                      <Label htmlFor="not_going">Not going</Label>
                    </div>
                  </RadioGroup>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setSelectedEvent(null)} 
                    className="mt-2 w-full"
                  >
                    Close
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubEvents;
