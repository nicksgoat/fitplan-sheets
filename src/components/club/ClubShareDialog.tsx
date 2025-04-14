
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClubList } from './ClubList';
import { useClubSelection } from '@/hooks/useClubSelection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Define specific type for the club share dialog props
interface ClubShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId?: string;
  contentType: 'workout' | 'program';
  selectedClubIds?: string[];
  onSelectionChange?: (selectedClubs: string[]) => void;
}

export function ClubShareDialog({
  open,
  onOpenChange,
  contentId,
  contentType,
  selectedClubIds = [],
  onSelectionChange
}: ClubShareDialogProps) {
  const { user } = useAuth();
  const {
    clubs,
    selectedClubIds: selectedIds,
    setSelectedClubIds,
    isLoading,
    loadUserClubs,
    toggleClub
  } = useClubSelection(selectedClubIds);

  useEffect(() => {
    if (user && open) {
      loadUserClubs();
    }
  }, [user, open, loadUserClubs]);
  
  useEffect(() => {
    setSelectedClubIds(selectedClubIds);
  }, [selectedClubIds, setSelectedClubIds]);

  const handleToggleClub = (clubId: string) => {
    const newSelection = toggleClub(clubId);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const handleSave = async () => {
    if (!contentId || !user) {
      // If contentId is not provided, just close the dialog
      // This allows the component to be used for selection only
      if (onSelectionChange) {
        onSelectionChange(selectedIds);
      }
      onOpenChange(false);
      return;
    }
    
    try {
      // First, let's delete all existing shared entries
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, contentId);
      
      if (deleteError) throw deleteError;
      
      // Now insert new entries if there are any selected clubs
      if (selectedIds.length > 0) {
        if (contentType === 'workout') {
          // Define explicit type for the array
          const sharesToCreate: Array<{
            workout_id: string;
            club_id: string;
            shared_by: string;
          }> = selectedIds.map(clubId => ({
            workout_id: contentId,
            club_id: clubId,
            shared_by: user.id
          }));
          
          const { error: insertError } = await supabase
            .from('club_shared_workouts')
            .insert(sharesToCreate);
          
          if (insertError) throw insertError;
        } else {
          // Define explicit type for the array
          const sharesToCreate: Array<{
            program_id: string;
            club_id: string;
            shared_by: string;
          }> = selectedIds.map(clubId => ({
            program_id: contentId,
            club_id: clubId,
            shared_by: user.id
          }));
          
          const { error: insertError } = await supabase
            .from('club_shared_programs')
            .insert(sharesToCreate);
          
          if (insertError) throw insertError;
        }
      }
      
      toast.success(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} sharing settings updated`);
      if (onSelectionChange) {
        onSelectionChange(selectedIds);
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving club sharing settings:", error);
      toast.error(`Failed to update sharing settings: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with Clubs</DialogTitle>
          <DialogDescription>
            Select which clubs should have access to this {contentType}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 my-4">
          <ClubList
            clubs={clubs}
            selectedIds={selectedIds}
            onToggle={handleToggleClub}
            isLoading={isLoading}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
