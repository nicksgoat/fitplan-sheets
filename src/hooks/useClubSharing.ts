
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

      if (clubIds.length > 0) {
        const shares = clubIds.map(clubId => ({
          club_id: clubId,
          [idField]: contentId,
          shared_by: user.id
        }));

        const { error } = await supabase
          .from(table)
          .insert(shares);
          
        if (error) throw error;
      }
      
      return clubIds;
    }
  });
}
