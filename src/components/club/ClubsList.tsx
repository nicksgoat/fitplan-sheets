
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Club } from '@/types/club';

interface ClubsListProps {
  clubs: Club[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedClubIds: string[];
  onClubToggle: (clubId: string) => void;
}

export function ClubsList({ 
  clubs, 
  isLoading, 
  isError, 
  selectedClubIds, 
  onClubToggle 
}: ClubsListProps) {
  if (isLoading) {
    return <div>Loading clubs...</div>;
  }
  
  if (isError) {
    return <div>Error loading clubs.</div>;
  }
  
  if (!clubs || clubs.length === 0) {
    return <div>No clubs found. Create a club to start sharing content.</div>;
  }
  
  return (
    <ScrollArea className="h-[200px] w-full rounded-md border">
      <div className="p-4">
        {clubs.map((club) => (
          <div key={club.id} className="flex items-center space-x-2">
            <Checkbox
              id={`club-${club.id}`}
              checked={selectedClubIds.includes(club.id)}
              onCheckedChange={() => onClubToggle(club.id)}
            />
            <Label htmlFor={`club-${club.id}`}>{club.name}</Label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
