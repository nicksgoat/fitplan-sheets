
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ClubEventsTabProps {
  clubId: string;
  events: any[];
  isUserClubMember: boolean;
  loadingEvents: boolean;
}

const ClubEventsTab: React.FC<ClubEventsTabProps> = ({
  clubId,
  events,
  isUserClubMember,
  loadingEvents,
}) => {
  const navigate = useNavigate();

  if (loadingEvents) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      {isUserClubMember && (
        <div className="mb-6">
          <Button
            onClick={() => navigate(`/clubs/${clubId}/events/create`)}
            variant="outline"
            className="w-full flex items-center gap-2 h-auto py-3 justify-start"
          >
            <PlusCircle size={20} />
            <span>Create Event</span>
          </Button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Calendar size={64} className="mb-4" />
          <h3 className="text-lg font-medium">No events yet</h3>
          <p>Be the first to create an event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <Card key={event.id} className="overflow-hidden">
              <div 
                className="h-36 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${
                    event.image_url || 
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
                  })` 
                }}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                <div className="flex items-center text-sm text-primary mb-2">
                  <Calendar size={16} className="mr-2" />
                  <span>{format(new Date(event.start_time), 'MMM d, yyyy')} • </span>
                  <span className="ml-1">
                    {format(new Date(event.start_time), 'h:mm a')}
                  </span>
                </div>
                
                {event.location && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📍 {event.location}
                  </p>
                )}
                
                <p className="text-muted-foreground line-clamp-2 mb-3">
                  {event.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {event.attendee_count || 0} attendees
                  </div>
                  <Button
                    onClick={() => navigate(`/clubs/${clubId}/events/${event.id}`)}
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubEventsTab;
