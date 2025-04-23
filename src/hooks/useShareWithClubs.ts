
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
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const sharingRecords = clubIds.map(clubId => ({
        club_id: clubId,
        [idField]: contentId,
        shared_by: user.id
      }));

      const { error } = await supabase
        .from(table)
        .insert(sharingRecords);
        
      if (error) throw error;
      
      return clubIds;
    }
  });
}
