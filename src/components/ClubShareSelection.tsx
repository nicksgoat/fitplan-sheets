
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClubShareDialog } from './club/ClubShareDialog';
import { ClubShareSelectionProps } from '@/types/clubSharing';

export function ClubShareSelection({ 
  contentId, 
  contentType, 
  sharedClubs = [], 
  onClubsChange,
  onSelectionChange,
  selectedClubIds: initialSelectedClubIds = []
}: ClubShareSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedClubIds);
  
  // Update local state when the prop changes
  useEffect(() => {
    if (sharedClubs && sharedClubs.length > 0) {
      setSelectedClubIds(sharedClubs);
    } else if (initialSelectedClubIds && initialSelectedClubIds.length > 0) {
      setSelectedClubIds(initialSelectedClubIds);
    }
  }, [sharedClubs, initialSelectedClubIds]);

  const handleSelectionChange = (clubs: string[]) => {
    setSelectedClubIds(clubs);
    
    // Call appropriate callback handlers
    if (onSelectionChange) {
      onSelectionChange(clubs);
    }
    if (onClubsChange) {
      onClubsChange(clubs);
    }
  };
  
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsOpen(true)}>
        <Plus size={16} />
        Share with Club
        {selectedClubIds.length > 0 && (
          <Badge variant="secondary" className="ml-1">{selectedClubIds.length}</Badge>
        )}
      </Button>
      
      <ClubShareDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        contentId={contentId || ''}
        contentType={contentType}
        selectedClubIds={selectedClubIds}
        onSelectionChange={handleSelectionChange}
      />
    </>
  );
}
