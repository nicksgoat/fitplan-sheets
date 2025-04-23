
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Simplified share record types to avoid excessive type nesting
type ShareInput = {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
};

export function useShareWithClubs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubIds, contentId, contentType }: ShareInput) => {
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
          const sharingRecords = sharesToAdd.map(clubId => ({
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
          const sharingRecords = sharesToAdd.map(clubId => ({
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
    onSuccess: (clubIds) => {
      toast.success("Content has been successfully shared with the selected clubs.");
      
      queryClient.invalidateQueries({ queryKey: ['creator-clubs', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share content with clubs.");
    }
  });
}
