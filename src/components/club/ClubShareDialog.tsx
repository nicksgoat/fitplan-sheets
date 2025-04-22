
import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ClubShareDialogProps } from '@/types/clubSharing';
import { useClubSelection } from '@/hooks/useClubSelection';
import { useShareWithClubs } from '@/hooks/useClubSharing';
import { ClubsList } from './ClubsList';

export function ClubShareDialog({ 
  open, 
  onOpenChange, 
  contentId, 
  contentType, 
  selectedClubIds: initialSelectedClubIds = [], 
  onSelectionChange 
}: ClubShareDialogProps) {
  
  // Use our custom hooks
  const { 
    clubs, 
    selectedClubIds, 
    isLoading, 
    loadUserClubs, 
    toggleClub
  } = useClubSelection(initialSelectedClubIds);
  
  const shareWithClubsMutation = useShareWithClubs();

  // Load user clubs when dialog opens
  useEffect(() => {
    if (open) {
      loadUserClubs();
    }
  }, [open, loadUserClubs]);

  const handleShare = async () => {
    if (selectedClubIds.length === 0) {
      toast.error("Please select at least one club to share with.");
      return;
    }

    shareWithClubsMutation.mutate({
      contentId,
      contentType,
      clubIds: selectedClubIds
    });

    if (onSelectionChange) {
      onSelectionChange(selectedClubIds);
    }
    
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share to Clubs</AlertDialogTitle>
          <AlertDialogDescription>
            Select the clubs you want to share this content with.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-4 py-4">
          <ClubsList
            clubs={clubs}
            isLoading={isLoading}
            selectedClubIds={selectedClubIds}
            onClubToggle={toggleClub}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={shareWithClubsMutation.isPending}>
            {shareWithClubsMutation.isPending ? "Sharing..." : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
