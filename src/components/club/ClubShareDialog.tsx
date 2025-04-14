
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClubShareDialogProps, WorkoutShareRecord, ProgramShareRecord } from '@/types/clubSharing';

interface Club {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
}

export function ClubShareDialog({ 
  open, 
  onOpenChange, 
  contentId, 
  contentType, 
  selectedClubIds: initialSelectedClubIds = [], 
  onSelectionChange 
}: ClubShareDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClubIds, setSelectedClubIds] = React.useState<string[]>(initialSelectedClubIds);

  const { data: clubs, isLoading, isError } = useQuery({
    queryKey: ['creator-clubs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  // Update local state when initialSelectedClubIds prop changes
  React.useEffect(() => {
    if (initialSelectedClubIds) {
      setSelectedClubIds(initialSelectedClubIds);
    }
  }, [initialSelectedClubIds]);

  const shareMutation = useMutation({
    mutationFn: async (clubIds: string[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Determine which table to use based on content type
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // First, get existing shares for validation
      const { data: existingShares, error: fetchError } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(contentIdField, contentId);
        
      if (fetchError) {
        console.error(`Error fetching ${contentType} shares:`, fetchError);
        throw fetchError;
      }

      const existingClubIds = new Set((existingShares || []).map(share => share.club_id));
      const sharesToAdd = clubIds.filter(id => !existingClubIds.has(id));
      
      // Insert new shares
      if (sharesToAdd.length > 0) {
        if (contentType === 'workout') {
          const sharingRecords: WorkoutShareRecord[] = sharesToAdd.map(clubId => ({
            club_id: clubId,
            workout_id: contentId,
            shared_by: user.id
          }));
          
          const { error } = await supabase
            .from('club_shared_workouts')
            .insert(sharingRecords);
            
          if (error) {
            console.error(`Error sharing workout:`, error);
            throw error;
          }
        } else {
          const sharingRecords: ProgramShareRecord[] = sharesToAdd.map(clubId => ({
            club_id: clubId,
            program_id: contentId,
            shared_by: user.id
          }));
          
          const { error } = await supabase
            .from('club_shared_programs')
            .insert(sharingRecords);
            
          if (error) {
            console.error(`Error sharing program:`, error);
            throw error;
          }
        }
      }
      
      // Handle removals (clubs that were previously shared but now unselected)
      const clubsToRemove = Array.from(existingClubIds).filter(id => !clubIds.includes(id as string));
      
      if (clubsToRemove.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(contentIdField, contentId)
          .in('club_id', clubsToRemove);
          
        if (error) {
          console.error(`Error removing ${contentType} shares:`, error);
          throw error;
        }
      }
      
      return clubIds;
    },
    onSuccess: (updatedClubIds) => {
      toast({
        title: "Content Shared!",
        description: "This content has been successfully shared with the selected clubs.",
      })
      
      // Call the onSelectionChange callback with updated clubs if provided
      if (onSelectionChange) {
        onSelectionChange(updatedClubIds);
      }
      
      queryClient.invalidateQueries({ queryKey: ['creator-clubs', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Sharing Failed",
        description: error.message || "Failed to share content with clubs.",
        variant: "destructive",
      })
    },
  });

  const handleCheckboxChange = (clubId: string) => {
    setSelectedClubIds(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  const handleShare = async () => {
    if (selectedClubIds.length === 0) {
      toast({
        title: "No Clubs Selected",
        description: "Please select at least one club to share with.",
        variant: "destructive",
      });
      return;
    }

    shareMutation.mutate(selectedClubIds);
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
          {isLoading ? (
            <div>Loading clubs...</div>
          ) : isError ? (
            <div>Error loading clubs.</div>
          ) : clubs && clubs.length > 0 ? (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4">
                {clubs.map((club) => (
                  <div key={club.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`club-${club.id}`}
                      checked={selectedClubIds.includes(club.id)}
                      onCheckedChange={() => handleCheckboxChange(club.id)}
                    />
                    <Label htmlFor={`club-${club.id}`}>{club.name}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div>No clubs found. Create a club to start sharing content.</div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={shareMutation.isPending}>
            {shareMutation.isPending ? "Sharing..." : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
