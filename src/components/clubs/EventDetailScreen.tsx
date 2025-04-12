import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Hourglass, 
  MapPin, 
  Users, 
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ClubEvent, EventParticipant, EventParticipationStatus } from '@/types/club';

const EventDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentEvent, 
    loadEvent, 
    joinEvent, 
    leaveEvent, 
    currentClub,
    currentEventParticipants,
    loadEventParticipants,
    isUserEventParticipant
  } = useClub();
  
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);
  
  useEffect(() => {
    if (currentEvent && user) {
      checkIsParticipant();
    }
  }, [currentEvent, user, currentEventParticipants]);
  
  const loadEventData = async () => {
    try {
      setLoading(true);
      
      if (!id) return;
      
      // Load event details
      await loadEvent(id);
      
      // Load event participants
      await loadEventParticipants(id);
      
    } catch (error) {
      console.error('Error loading event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIsParticipant = () => {
    if (!user || !id) return;
    
    const participantStatus = isUserEventParticipant(id);
    setIsParticipant(participantStatus);
  };
  
  const handleJoinEvent = async () => {
    if (!user) {
      toast.error('You need to be logged in to join an event');
      return;
    }
    
    if (!currentEvent) return;
    
    try {
      setJoining(true);
      await joinEvent(currentEvent.id, 'going');
      setIsParticipant(true);
      toast.success('You have joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join the event');
    } finally {
      setJoining(false);
    }
  };
  
  const handleLeaveEvent = async () => {
    if (!user || !currentEvent) return;
    
    try {
      setJoining(true);
      await leaveEvent(currentEvent.id);
      setIsParticipant(false);
      toast.success('You have left the event');
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave the event');
    } finally {
      setJoining(false);
    }
  };
  
  const handleOpenLocation = () => {
    if (!currentEvent?.location) return;
    
    const query = encodeURIComponent(currentEvent.location);
    const url = `https://maps.google.com/?q=${query}`;
    window.open(url, '_blank');
  };
  
  const formatDateInfo = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  const formatTimeInfo = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  const calculateDuration = () => {
    if (!currentEvent) return '';
    
    const start = new Date(currentEvent.start_time);
    const end = new Date(currentEvent.end_time);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="w-full h-64" />
        <Skeleton className="h-10 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    );
  }
  
  if (!currentEvent || !currentClub) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg text-gray-400">Event not found</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Event Details</h2>
        <div className="w-8"></div>
      </div>

      {showChat ? (
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between p-4 border-b">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowChat(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-medium">Event Chat</h3>
            <div className="w-8"></div>
          </div>
          
          {/* EventChatBox component would go here */}
          <div className="flex-1 p-4">
            <p className="text-center text-muted-foreground py-8">
              Event chat functionality is not implemented yet
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="w-full h-64 bg-gray-800 relative">
              {currentEvent.image_url ? (
                <img 
                  src={currentEvent.image_url} 
                  alt={currentEvent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <Calendar className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-6">
              <h1 className="text-2xl font-bold">{currentEvent.name}</h1>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <span className="text-foreground">
                    {formatDateInfo(currentEvent.start_time)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="text-foreground">
                    {formatTimeInfo(currentEvent.start_time)} - {formatTimeInfo(currentEvent.end_time)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Hourglass className="h-5 w-5 text-primary mr-2" />
                  <span className="text-foreground">{calculateDuration()}</span>
                </div>
                
                {currentEvent.location && (
                  <button 
                    className="flex items-center text-left w-full"
                    onClick={handleOpenLocation}
                  >
                    <MapPin className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span className="text-foreground underline">{currentEvent.location}</span>
                    <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
                  </button>
                )}
              </div>
              
              <div 
                className="flex items-center p-3 border rounded-md bg-card"
                onClick={() => navigate(`/clubs/${currentClub.id}`)}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full overflow-hidden mr-3">
                  {currentClub.logo_url ? (
                    <img 
                      src={currentClub.logo_url} 
                      alt={currentClub.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-primary font-semibold">
                        {currentClub.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{currentClub.name}</h4>
                  <span className="text-sm text-muted-foreground capitalize">
                    {currentClub.club_type} Club
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">About this event</h3>
                <p className="text-muted-foreground">
                  {currentEvent.description || 'No description provided.'}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Participants ({currentEventParticipants.length})
                </h3>
                
                {currentEventParticipants.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No one has joined this event yet. Be the first to join!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4 py-2">
                    {currentEventParticipants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className="flex flex-col items-center w-16"
                      >
                        <Avatar className="w-12 h-12 mb-1">
                          <AvatarImage 
                            src={participant.profile?.avatar_url || ''} 
                            alt={participant.profile?.display_name || 'User'} 
                          />
                          <AvatarFallback>
                            {(participant.profile?.display_name?.[0] || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-center truncate w-full">
                          {participant.profile?.display_name || 'Anonymous'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowChat(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Event Chat
              </Button>
            </div>
          </div>
          
          <div className="border-t p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">
                {currentEvent.attendee_count || currentEventParticipants.length} attending
              </span>
            </div>
            
            {isParticipant ? (
              <Button
                variant="outline"
                onClick={handleLeaveEvent}
                disabled={joining}
              >
                {joining ? 'Leaving...' : 'Leave Event'}
              </Button>
            ) : (
              <Button
                onClick={handleJoinEvent}
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Event'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetailScreen;
