
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClubEvent } from '@/types/club';

interface EventCardProps {
  event: ClubEvent;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  // Format date and time
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEE, MMM d');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch (e) {
      return 'Invalid time';
    }
  };
  
  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b';
  
  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={event.image_url || defaultImage} 
          alt={event.name} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-md">
          <span className="text-white text-sm font-medium">
            {formatDate(event.start_time)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{event.name}</h3>
        
        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          <div className="flex items-center text-gray-400">
            <Clock className="h-4 w-4 mr-1 text-fitbloom-purple" />
            <span>{formatTime(event.start_time)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-gray-400">
              <MapPin className="h-4 w-4 mr-1 text-fitbloom-purple" />
              <span className="truncate max-w-[150px]">{event.location}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="h-4 w-4 mr-1 text-fitbloom-purple" />
            <span>{event.attendee_count || 0} attending</span>
          </div>
          
          <Badge variant="outline" className="bg-fitbloom-purple text-white border-none">
            {event.category || 'Event'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
