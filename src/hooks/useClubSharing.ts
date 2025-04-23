
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ShareInput {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

export function useShareWithClubs(onSuccess?: (clubIds: string[]) => void) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubIds, contentId, contentType }: ShareInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // First get existing shares
      const { data: existingShares, error: fetchError } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(contentIdField, contentId);
        
      if (fetchError) throw fetchError;

      const existingClubIds = new Set((existingShares || []).map(share => share.club_id));
      const sharesToAdd = clubIds.filter(id => !existingClubIds.has(id));
      
      // Add new shares
      if (sharesToAdd.length > 0) {
        // Create properly typed sharing records
        const sharingRecords = sharesToAdd.map(clubId => {
          // Using a type-safe approach to create the sharing records
          if (contentType === 'workout') {
            return {
              club_id: clubId,
              workout_id: contentId,
              shared_by: user.id
            };
          } else {
            return {
              club_id: clubId,
              program_id: contentId,
              shared_by: user.id
            };
          }
        });
        
        const { error } = await supabase
          .from(tableName)
          .insert(sharingRecords);
            
        if (error) throw error;
      }
      
      // Remove unselected shares
      const clubsToRemove = Array.from(existingClubIds).filter(id => !clubIds.includes(id as string));
      
      if (clubsToRemove.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(contentIdField, contentId)
          .in('club_id', clubsToRemove);
          
        if (error) throw error;
      }
      
      return clubIds;
    },
    onSuccess: (clubIds) => {
      toast.success("Content shared successfully with selected clubs");
      
      if (onSuccess) {
        onSuccess(clubIds);
      }
      
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['creator-clubs', user.id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share content with clubs");
    }
  });
}

export function useSharedClubs(contentId: string, contentType: 'workout' | 'program') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['shared-clubs', contentType, contentId],
    queryFn: async () => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(contentIdField, contentId);
        
      if (error) throw error;
      
      return (data || []).map(share => share.club_id);
    },
    enabled: !!contentId && !!user?.id
  });
}
