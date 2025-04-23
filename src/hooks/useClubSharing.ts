
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ShareWorkoutInput = {
  contentId: string;
  clubIds: string[];
};

type ShareProgramInput = {
  contentId: string;
  clubIds: string[];
};

export function useShareWithClubs() {
  const { user } = useAuth();

  const shareWorkoutMutation = useMutation({
    mutationFn: async ({ clubIds, contentId }: ShareWorkoutInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Process each club ID separately
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
      
      return clubIds;
    }
  });

  const shareProgramMutation = useMutation({
    mutationFn: async ({ clubIds, contentId }: ShareProgramInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Process each club ID separately
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
      
      return clubIds;
    }
  });

  // Combined function to share either workout or program
  const shareContent = (contentId: string, contentType: 'workout' | 'program', clubIds: string[]) => {
    if (contentType === 'workout') {
      return shareWorkoutMutation.mutateAsync({ contentId, clubIds });
    } else {
      return shareProgramMutation.mutateAsync({ contentId, clubIds });
    }
  };

  return {
    shareWorkoutMutation,
    shareProgramMutation,
    shareContent,
    isLoading: shareWorkoutMutation.isPending || shareProgramMutation.isPending
  };
}
