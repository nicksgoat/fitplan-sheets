
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShareContentOptions {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

export function useShareWithClubs() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ contentId, contentType, clubIds }: ShareContentOptions) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }
      
      // First, get existing shares for this content
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { data: existingShares, error: fetchError } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(idField, contentId);
      
      if (fetchError) {
        console.error(`Error fetching existing ${contentType} shares:`, fetchError);
        throw new Error(`Failed to retrieve existing shares for ${contentType}`);
      }
      
      const existingClubIds = existingShares?.map(share => share.club_id) || [];
      
      // Find clubs to add and remove
      const clubsToAdd = clubIds.filter(id => !existingClubIds.includes(id));
      const clubsToRemove = existingClubIds.filter(id => !clubIds.includes(id));
      
      // Add new shares
      if (clubsToAdd.length > 0) {
        const sharesToInsert = clubsToAdd.map(clubId => {
          const shareData: Record<string, any> = {
            club_id: clubId,
            shared_by: userData.user.id
          };
          
          // Add the content ID field based on content type
          shareData[idField] = contentId;
          
          return shareData;
        });
        
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(sharesToInsert);
        
        if (insertError) {
          console.error(`Error sharing ${contentType} with clubs:`, insertError);
          throw new Error(`Failed to share ${contentType} with clubs`);
        }
      }
      
      // Remove shares that were deselected
      if (clubsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq(idField, contentId)
          .in('club_id', clubsToRemove);
        
        if (deleteError) {
          console.error(`Error removing ${contentType} sharing:`, deleteError);
          throw new Error(`Failed to update ${contentType} sharing`);
        }
      }
      
      // Return the final list of club IDs
      return clubIds;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-shares', variables.contentId, variables.contentType] });
      queryClient.invalidateQueries({ queryKey: ['club-content', variables.contentType] });
      toast.success(`${variables.contentType === 'workout' ? 'Workout' : 'Program'} sharing updated`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}
