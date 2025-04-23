
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ShareInput = {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
};

export function useShareWithClubs() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ clubIds, contentId, contentType }: ShareInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete existing shares first
      await supabase
        .from(contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs')
        .delete()
        .eq(contentType === 'workout' ? 'workout_id' : 'program_id', contentId);

      // If there are clubs to share with
      if (clubIds.length > 0) {
        try {
          const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
          const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
          
          // Process shares in batch
          const sharesToInsert = clubIds.map(clubId => ({
            club_id: clubId,
            [contentIdField]: contentId,
            shared_by: user.id
          }));
          
          const { error } = await supabase
            .from(table)
            .insert(sharesToInsert);
            
          if (error) throw error;
        } catch (error) {
          console.error('Error sharing with clubs:', error);
          throw error;
        }
      }
      
      return clubIds;
    }
  });
}
