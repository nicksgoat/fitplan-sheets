
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
        const insertData = clubIds.map(clubId => ({
          club_id: clubId,
          [contentType === 'workout' ? 'workout_id' : 'program_id']: contentId,
          shared_by: user.id
        }));

        const { error } = await supabase.from(table).insert(insertData);
        if (error) throw error;
      }
      
      return clubIds;
    }
  });
}
