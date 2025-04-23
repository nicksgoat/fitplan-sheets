
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClubShareDialog } from './club/ClubShareDialog';

export interface ClubShareSelectionProps {
  contentId?: string;
  contentType: 'workout' | 'program';
  onClubsChange?: (clubs: string[]) => void;
  initialSelectedClubs?: string[];
}

export function ClubShareSelection({ 
  contentId, 
  contentType,
  onClubsChange,
  initialSelectedClubs = []
}: ClubShareSelectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedClubs, setSelectedClubs] = React.useState<string[]>(initialSelectedClubs);

  const handleSelectionChange = (clubs: string[]) => {
    setSelectedClubs(clubs);
    if (onClubsChange) {
      onClubsChange(clubs);
    }
  };
  
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsOpen(true)}>
        <Plus size={16} />
        Share with Club
        {selectedClubs.length > 0 && (
          <Badge variant="secondary" className="ml-1">{selectedClubs.length}</Badge>
        )}
      </Button>
      
      <ClubShareDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        contentId={contentId || ''}
        contentType={contentType}
        selectedClubs={selectedClubs}
        onSelectionChange={handleSelectionChange}
      />
    </>
  );
}
