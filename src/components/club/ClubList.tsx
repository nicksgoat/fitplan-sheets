
import React from 'react';
import { ClubItem } from './ClubItem';
import { Club } from '@/types/clubSharing';

interface ClubListProps {
  clubs: Club[];
  selectedIds: string[];
  onToggle: (clubId: string) => void;
  isLoading: boolean;
}

export function ClubList({ clubs, selectedIds, onToggle, isLoading }: ClubListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading your clubs...</p>
      </div>
    );
  }
  
  if (clubs.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          You don't have any clubs where you are an admin or owner.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {clubs.map((club) => (
        <ClubItem
          key={club.id}
          club={club}
          isSelected={selectedIds.includes(club.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
