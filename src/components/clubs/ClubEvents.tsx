import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  ThumbsUp, 
  HelpCircle, 
  X,
  MoreVertical,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isFuture } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClubEvent, EventParticipationStatus, EventParticipant } from '@/types/club';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EventForm from './EventForm';

interface ClubEventsProps {
  clubId: string;
}

const ClubEvents: React.FC<ClubEventsProps> = ({ clubId }) => {
  const { 
    events, 
    loadingEvents, 
    createNewEvent, 
    updateExistingEvent, 
    removeEvent, 
    respondToClubEvent,
    isUserClubAdmin, 
    isUserClubMember 
  } = useClub();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<ClubEvent | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMember = isUserClubMember(clubId);
  const isAdmin = isUserClubAdmin(clubId);
  
  const upcomingEvents = events
    .filter(event => isFuture(parseISO(event.start_time)))
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
    
  const pastEvents = events
    .filter(event => !isFuture(parseISO(event.start_time)))
    .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());
  
  const handleCreateEvent = async (eventData: Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      console.log("Creating new event:", eventData);
      await createNewEvent(eventData);
      setCreateDialogOpen(false);
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateEvent = async (eventData: Partial<Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!editEvent) return;
    
    try {
      await updateExistingEvent(editEvent.id, eventData);
      setEditEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    
    try {
      await removeEvent(deleteEventId);
      setDeleteEventId(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };
  
  const handleRespondToEvent = async (eventId: string, status: EventParticipationStatus) => {
    if (!user) {
      toast.error('You must be logged in to respond to events');
      return;
    }
    
    try {
      await respondToClubEvent(eventId, status);
    } catch (error) {
      console.error('Error responding to event:', error);
      toast.error('Failed to respond to event');
    }
  };
  
  if (loadingEvents) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-dark-300 rounded-lg p-4 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48 bg-dark-400" />
              <Skeleton className="h-6 w-24 bg-dark-400" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-dark-400" />
              <Skeleton className="h-4 w-3/4 bg-dark-400" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 bg-dark-400" />
              <Skeleton className="h-4 w-24 bg-dark-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        {(isMember && isAdmin) && (
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>
      
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-8 bg-dark-300 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-400">No upcoming events scheduled</p>
          {(isMember && isAdmin) && (
            <Button 
              className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              currentUserId={user?.id}
              isAdmin={isAdmin}
              isMember={isMember}
              onEdit={() => setEditEvent(event)}
              onDelete={() => setDeleteEventId(event.id)}
              onRespond={handleRespondToEvent}
            />
          ))}
        </div>
      )}
      
      {pastEvents.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-8">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            {pastEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                currentUserId={user?.id}
                isAdmin={isAdmin}
                isMember={isMember}
                isPast={true}
                onEdit={() => setEditEvent(event)}
                onDelete={() => setDeleteEventId(event.id)}
                onRespond={handleRespondToEvent}
              />
            ))}
          </div>
        </>
      )}
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-dark-200 border-dark-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Schedule a new event for your club members.
            </DialogDescription>
          </DialogHeader>
          
          <EventForm 
            clubId={clubId} 
            userId={user?.id || ''}
            onSubmit={handleCreateEvent}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent className="bg-dark-200 border-dark-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details of your event.
            </DialogDescription>
          </DialogHeader>
          
          {editEvent && (
            <EventForm 
              clubId={clubId}
              userId={user?.id || ''}
              event={editEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setEditEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <DialogContent className="bg-dark-200 border-dark-300">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEventId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface EventCardProps {
  event: ClubEvent;
  currentUserId?: string;
  isAdmin: boolean;
  isMember: boolean;
  isPast?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRespond: (eventId: string, status: EventParticipationStatus) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  currentUserId,
  isAdmin,
  isMember,
  isPast = false,
  onEdit, 
  onDelete, 
  onRespond 
}) => {
  const [showingParticipants, setShowingParticipants] = useState(false);
  
  const formatEventDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
    } catch (e) {
      return "Unknown date";
    }
  };
  
  const formatEventTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch (e) {
      return "Unknown time";
    }
  };
  
  const getUserResponse = (): EventParticipationStatus | null => {
    if (!currentUserId) return null;
    
    const userParticipation = event.participants?.find(p => p.user_id === currentUserId);
    return userParticipation ? userParticipation.status : null;
  };
  
  const userResponse = getUserResponse();
  
  const goingCount = event.participants?.filter(p => p.status === 'going').length || 0;
  const maybeCount = event.participants?.filter(p => p.status === 'maybe').length || 0;
  
  return (
    <Card className="bg-dark-300 border-dark-400 overflow-hidden">
      {event.image_url && (
        <div 
          className="h-32 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${event.image_url})` }}
        />
      )}
      
      <CardHeader className={`pb-2 ${event.image_url ? '' : 'pt-4'}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          
          {isAdmin && !isPast && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-2">
        {event.description && (
          <p className="text-sm text-gray-400 mb-2">{event.description}</p>
        )}
        
        <div className="flex items-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-fitbloom-purple" />
          <span>{formatEventDate(event.start_time)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-300">
          <Clock className="h-4 w-4 mr-2 text-fitbloom-purple" />
          <span>{formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-fitbloom-purple" />
            <span>{event.location}</span>
          </div>
        )}
        
        <div 
          className="flex items-center text-sm text-gray-300 cursor-pointer"
          onClick={() => setShowingParticipants(!showingParticipants)}
        >
          <Users className="h-4 w-4 mr-2 text-fitbloom-purple" />
          <span>
            {goingCount} going
            {maybeCount > 0 && `, ${maybeCount} maybe`}
          </span>
        </div>
        
        {showingParticipants && event.participants && event.participants.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dark-400">
            <div className="flex flex-wrap gap-2">
              {event.participants.map(participant => (
                <div key={participant.id} className="flex items-center">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.profile?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {participant.profile?.display_name?.charAt(0) || 
                       participant.profile?.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs ml-1">
                    {participant.profile?.display_name || participant.profile?.username || 'Unknown'}
                  </span>
                  {participant.status === 'going' && (
                    <Badge className="ml-1 bg-green-600 text-[10px] px-1">Going</Badge>
                  )}
                  {participant.status === 'maybe' && (
                    <Badge className="ml-1 bg-yellow-600 text-[10px] px-1">Maybe</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {!isPast && isMember && (
        <CardFooter className="pt-2 flex justify-between border-t border-dark-400">
          <Button 
            variant={userResponse === 'going' ? 'default' : 'outline'} 
            size="sm"
            className={userResponse === 'going' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => onRespond(event.id, 'going')}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Going
          </Button>
          
          <Button 
            variant={userResponse === 'maybe' ? 'default' : 'outline'} 
            size="sm"
            className={userResponse === 'maybe' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            onClick={() => onRespond(event.id, 'maybe')}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Maybe
          </Button>
          
          <Button 
            variant={userResponse === 'not_going' ? 'default' : 'outline'} 
            size="sm"
            className={userResponse === 'not_going' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => onRespond(event.id, 'not_going')}
          >
            <X className="h-4 w-4 mr-1" />
            No
          </Button>
        </CardFooter>
      )}
      
      {isPast && (
        <CardFooter className="pt-2 border-t border-dark-400">
          <Badge variant="outline" className="bg-dark-200">Event Completed</Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default ClubEvents;
