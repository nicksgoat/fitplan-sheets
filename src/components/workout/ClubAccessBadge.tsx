
import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClubAccessBadgeProps {
  isClubShared?: boolean;
  clubs?: string[];
  className?: string;
}

export function ClubAccessBadge({ 
  isClubShared = false, 
  clubs = [], 
  className = "" 
}: ClubAccessBadgeProps) {
  if (!isClubShared) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-green-900/20 text-green-400 border-green-800 flex items-center gap-1 ${className}`}
          >
            <Users className="h-3 w-3" />
            <span>Club Access</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Available through club membership</p>
          <p className="text-xs text-gray-400 mt-1">Shared with {clubs?.length || 0} club{clubs?.length !== 1 ? 's' : ''}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
