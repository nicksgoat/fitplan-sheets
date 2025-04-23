
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
      
      // Handle each club ID separately to ensure proper typing
      for (const clubId of clubIds) {
        if (contentType === 'workout') {
          const { error } = await supabase
            .from('club_shared_workouts')
            .insert({
              club_id: clubId,
              workout_id: contentId,
              shared_by: user.id
            });
            
          if (error) throw error;
        } else {
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
      
      return clubIds;
    }
  });
}
