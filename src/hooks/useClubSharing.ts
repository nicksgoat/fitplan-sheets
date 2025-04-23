
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

      // Handle content sharing based on type
      if (contentType === 'workout') {
        // Create array of workout shares
        const workoutShares = clubIds.map(clubId => ({
          club_id: clubId,
          workout_id: contentId,
          shared_by: user.id
        }));
        
        // Insert all workout shares at once
        const { error } = await supabase
          .from('club_shared_workouts')
          .insert(workoutShares);
          
        if (error) throw error;
      } else {
        // Create array of program shares
        const programShares = clubIds.map(clubId => ({
          club_id: clubId,
          program_id: contentId,
          shared_by: user.id
        }));
        
        // Insert all program shares at once
        const { error } = await supabase
          .from('club_shared_programs')
          .insert(programShares);
          
        if (error) throw error;
      }
      
      return clubIds;
    }
  });
}
