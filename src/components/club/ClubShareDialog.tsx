
import React from 'react';
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
import { useShareWithClub } from '@/hooks/useShareWithClub';
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
    selectedClubIds, 
    clubs, 
    isLoading, 
    isError, 
    handleCheckboxChange 
  } = useClubSelection(initialSelectedClubIds);
  
  const shareWithClub = useShareWithClub(onSelectionChange);

  const handleShare = async () => {
    if (selectedClubIds.length === 0) {
      toast({
        title: "No Clubs Selected",
        description: "Please select at least one club to share with.",
        variant: "destructive",
      });
      return;
    }

    shareWithClub.mutate({
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
            isError={isError}
            selectedClubIds={selectedClubIds}
            onClubToggle={handleCheckboxChange}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={shareWithClub.isPending}>
            {shareWithClub.isPending ? "Sharing..." : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
