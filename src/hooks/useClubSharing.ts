
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

      const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      
      // Delete existing shares
      await supabase
        .from(table)
        .delete()
        .eq(contentType === 'workout' ? 'workout_id' : 'program_id', contentId);

      // Insert new shares if there are any clubs selected
      if (clubIds.length > 0) {
        try {
          if (contentType === 'workout') {
            // Create an array of workout shares
            const workoutShares = clubIds.map(clubId => ({
              club_id: clubId,
              workout_id: contentId,
              shared_by: user.id
            }));
            
            const { error } = await supabase
              .from('club_shared_workouts')
              .insert(workoutShares);
            
            if (error) throw error;
          } else {
            // Create an array of program shares
            const programShares = clubIds.map(clubId => ({
              club_id: clubId,
              program_id: contentId,
              shared_by: user.id
            }));
            
            const { error } = await supabase
              .from('club_shared_programs')
              .insert(programShares);
            
            if (error) throw error;
          }
        } catch (error) {
          console.error('Error sharing with clubs:', error);
          throw error;
        }
      }
      
      return clubIds;
    }
  });
}
