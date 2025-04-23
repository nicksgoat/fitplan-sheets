
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClubShareDialog } from './club/ClubShareDialog';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Updated interface to include all necessary props
export interface ClubShareSelectionProps {
  contentId?: string;
  contentType: 'workout' | 'program';
  sharedClubs?: string[];
  selectedClubIds?: string[];
  onClubsChange?: (clubs: string[]) => void;
  onSelectionChange?: (clubs: string[]) => void;
}

// This component allows selecting a single club with a dropdown
export function ClubSelection({ 
  onClubSelect, 
  selectedClubId 
}: { 
  onClubSelect: (clubId: string) => void; 
  selectedClubId: string | null;
}) {
  const { user } = useAuth();

  // Fetch clubs created by the user
  const { data: clubs, isLoading } = useQuery({
    queryKey: ['user-clubs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <Select value={selectedClubId || undefined} onValueChange={onClubSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a club" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading clubs...</SelectItem>
          ) : clubs && clubs.length > 0 ? (
            clubs.map((club) => (
              <SelectItem key={club.id} value={club.id}>
                {club.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No clubs found</SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// This component supports sharing content with multiple clubs via a dialog
export function ClubShareSelection({ 
  contentId, 
  contentType, 
  sharedClubs = [], 
  onClubsChange,
  onSelectionChange,
  selectedClubIds = []
}: ClubShareSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(selectedClubIds);
  
  // Update local state when the prop changes
  useEffect(() => {
    if (sharedClubs && sharedClubs.length > 0) {
      setSelectedClubIds(sharedClubs);
    } else if (selectedClubIds && selectedClubIds.length > 0) {
      setSelectedClubIds(selectedClubIds);
    }
  }, [sharedClubs, selectedClubIds]);

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
