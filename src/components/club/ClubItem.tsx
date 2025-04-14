
import React from 'react';
import { Check } from 'lucide-react';
import { Club } from '@/types/clubSharing';

interface ClubItemProps {
  club: Club;
  isSelected: boolean;
  onToggle: (clubId: string) => void;
}

export function ClubItem({ club, isSelected, onToggle }: ClubItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:bg-accent"
      }`}
      onClick={() => onToggle(club.id)}
    >
      <div className="flex items-center gap-3">
        {club.logo_url ? (
          <img
            src={club.logo_url}
            alt={club.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            {club.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium">{club.name}</p>
          {club.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {club.description}
            </p>
          )}
        </div>
      </div>
      
      {isSelected && (
        <Check size={18} className="text-primary" />
      )}
    </div>
  );
}
