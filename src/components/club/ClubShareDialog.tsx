
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
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  
  // Use our custom hooks
  const { 
    clubs, 
    selectedClubIds, 
    isLoading, 
    loadUserClubs, 
    toggleClub
  } = useClubSelection(initialSelectedClubIds);
  
  const shareWithClubs = useShareWithClubs();

  // Load user clubs when dialog opens
  useEffect(() => {
    if (open) {
      loadUserClubs();
    }
  }, [open, loadUserClubs]);

  const handleShare = async () => {
    if (selectedClubIds.length === 0) {
      toast({
        title: "No Clubs Selected",
        description: "Please select at least one club to share with.",
        variant: "destructive",
      });
      return;
    }

    shareWithClubs.mutate({
      contentId,
      contentType,
      clubIds: selectedClubIds
    });
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
          <AlertDialogAction onClick={handleShare} disabled={shareWithClubs.isPending}>
            {shareWithClubs.isPending ? "Sharing..." : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
