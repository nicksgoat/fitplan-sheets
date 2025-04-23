
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ShareInput {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

export function useShareWithClubs() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ clubIds, contentId, contentType }: ShareInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete existing shares first
      const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      await supabase
        .from(table)
        .delete()
        .eq(idField, contentId);

      // Insert new shares if there are any clubs selected
      if (clubIds.length > 0) {
        // Handle workout sharing
        if (contentType === 'workout') {
          const workoutShares = clubIds.map(clubId => ({
            club_id: clubId,
            workout_id: contentId,
            shared_by: user.id
          }));
          
          const { error: workoutError } = await supabase
            .from('club_shared_workouts')
            .insert(workoutShares);
            
          if (workoutError) throw workoutError;
        } 
        // Handle program sharing
        else {
          const programShares = clubIds.map(clubId => ({
            club_id: clubId,
            program_id: contentId,
            shared_by: user.id
          }));
          
          const { error: programError } = await supabase
            .from('club_shared_programs')
            .insert(programShares);
            
          if (programError) throw programError;
        }
      }
      
      return clubIds;
    }
  });
}
