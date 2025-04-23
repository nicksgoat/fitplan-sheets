
import React from 'react';
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Calendar, 
  Megaphone, 
  ChevronRight 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ClubChannelProps {
  channel: {
    id: string;
    name: string;
    description?: string;
    type: string;
    is_default?: boolean;
  };
  onClick: (channel: any) => void;
  isActive?: boolean;
}

const ClubChannel = ({ channel, onClick, isActive = false }: ClubChannelProps) => {
  // Get icon based on channel type
  const getChannelIcon = () => {
    switch (channel.type) {
      case 'events':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'announcements':
        return <Megaphone className="h-5 w-5 text-primary" />;
      default:
        return <MessageSquare className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div
      className={cn(
        "flex items-center px-4 py-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
        isActive && "bg-muted"
      )}
      onClick={() => onClick(channel)}
    >
      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center mr-3">
        {getChannelIcon()}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center">
          <p className="font-medium text-foreground">{channel.name}</p>
          {channel.is_default && (
            <Badge variant="default" className="ml-2 text-xs">Default</Badge>
          )}
        </div>
        
        {channel.description && (
          <p className="text-sm text-muted-foreground truncate">{channel.description}</p>
        )}
      </div>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default ClubChannel;
