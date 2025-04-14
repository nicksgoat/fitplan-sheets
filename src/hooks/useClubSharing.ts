
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
      if (!contentId) throw new Error('Content ID is required');

      // Determine which table to use based on content type
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Clear existing shares first
      const { error: clearError } = await supabase
        .from(tableName)
        .delete()
        .eq(contentIdField, contentId);
      
      if (clearError) {
        console.error(`Error clearing existing ${contentType} shares:`, clearError);
        throw clearError;
      }
      
      // Insert new shares if any clubs are selected
      if (clubIds.length > 0) {
        const sharingRecords = clubIds.map(clubId => {
          // Create the proper record with the correct field based on content type
          if (contentType === 'workout') {
            return {
              club_id: clubId,
              workout_id: contentId,
              shared_by: user.id
            };
          } else {
            return {
              club_id: clubId,
              program_id: contentId,
              shared_by: user.id
            };
          }
        });
        
        const { error: shareError } = await supabase
          .from(tableName)
          .insert(sharingRecords);
          
        if (shareError) {
          console.error(`Error sharing ${contentType}:`, shareError);
          throw shareError;
        }
      }
      
      return clubIds;
    },
    onSuccess: () => {
      toast.success("Content has been shared with your selected clubs");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to share content with clubs");
    }
  });
}
