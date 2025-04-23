
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

export interface ClubShareSelectionProps {
  contentId?: string;
  contentType: 'workout' | 'program';
  sharedClubs?: string[];
  onClubsChange?: (clubs: string[]) => void;
  initialSelectedClubs?: string[];
}

export function ClubSelection({ 
  onClubSelect, 
  selectedClubId 
}: { 
  onClubSelect: (clubId: string) => void; 
  selectedClubId: string | null;
}) {
  const { user } = useAuth();

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

export function ClubShareSelection({ 
  contentId, 
  contentType, 
  sharedClubs = [], 
  onClubsChange,
  initialSelectedClubs = []
}: ClubShareSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedClubs);
  
  useEffect(() => {
    if (sharedClubs.length > 0) {
      setSelectedClubIds(sharedClubs);
    } else if (initialSelectedClubs.length > 0) {
      setSelectedClubIds(initialSelectedClubs);
    }
  }, [sharedClubs, initialSelectedClubs]);

  const handleSelectionChange = (clubs: string[]) => {
    setSelectedClubIds(clubs);
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
