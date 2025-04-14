
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Club } from '@/types/clubSharing';

interface ClubsListProps {
  clubs: Club[] | undefined;
  isLoading: boolean;
  selectedClubIds: string[];
  onClubToggle: (clubId: string) => string[];
}

export function ClubsList({ 
  clubs, 
  isLoading, 
  selectedClubIds, 
  onClubToggle 
}: ClubsListProps) {
  if (isLoading) {
    return <div>Loading clubs...</div>;
  }
  
  if (!clubs || clubs.length === 0) {
    return <div>No clubs found. Create a club to start sharing content.</div>;
  }
  
  return (
    <ScrollArea className="h-[200px] w-full rounded-md border">
      <div className="p-4">
        {clubs.map((club) => (
          <div key={club.id} className="flex items-center space-x-2 py-1">
            <Checkbox
              id={`club-${club.id}`}
              checked={selectedClubIds.includes(club.id)}
              onCheckedChange={() => onClubToggle(club.id)}
            />
            <Label htmlFor={`club-${club.id}`} className="cursor-pointer">
              {club.name}
            </Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
