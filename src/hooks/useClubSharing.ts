
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ShareInput = {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
};

// Define separate interfaces for workout and program shares to avoid type recursion
type WorkoutShare = {
  club_id: string;
  workout_id: string;
  shared_by: string;
};

type ProgramShare = {
  club_id: string;
  program_id: string;
  shared_by: string;
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
          if (contentType === 'workout') {
            // Process workout shares
            for (const clubId of clubIds) {
              const { error } = await supabase
                .from('club_shared_workouts')
                .insert({
                  club_id: clubId,
                  workout_id: contentId,
                  shared_by: user.id
                });
                
              if (error) throw error;
            }
          } else {
            // Process program shares
            for (const clubId of clubIds) {
              const { error } = await supabase
                .from('club_shared_programs')
                .insert({
                  club_id: clubId,
                  program_id: contentId,
                  shared_by: user.id
                });
                
              if (error) throw error;
            }
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
