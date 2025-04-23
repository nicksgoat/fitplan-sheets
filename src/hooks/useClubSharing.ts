
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface ShareContentConfig {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

export function useClubSharing() {
  const { user } = useAuth();
  
  const shareContent = useMutation({
    mutationFn: async ({ contentId, contentType, clubIds }: ShareContentConfig) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Get existing shares
      const { data: existingShares } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(contentIdField, contentId);
      
      const existingClubIds = new Set((existingShares || []).map(share => share.club_id));
      const sharesToAdd = clubIds.filter(id => !existingClubIds.has(id));
      const sharesToRemove = Array.from(existingClubIds).filter(id => !clubIds.includes(id as string));
      
      // Add new shares
      if (sharesToAdd.length > 0) {
        const insertData = sharesToAdd.map(clubId => ({
          club_id: clubId,
          [contentIdField]: contentId,
          shared_by: user.id
        }));
        
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(insertData);
        
        if (insertError) throw insertError;
      }
      
      // Remove unselected shares
      if (sharesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq(contentIdField, contentId)
          .in('club_id', sharesToRemove);
        
        if (deleteError) throw deleteError;
      }
      
      return clubIds;
    },
    onSuccess: () => {
      toast.success('Content sharing updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update content sharing: ${error.message}`);
    }
  });
  
  return { shareContent };
}

export function useSharedClubs(contentId: string, contentType: 'workout' | 'program') {
  return useQuery({
    queryKey: ['shared-clubs', contentType, contentId],
    queryFn: async () => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const contentIdField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('club_id')
        .eq(contentIdField, contentId);
        
      if (error) throw error;
      
      return (data || []).map(share => share.club_id);
    },
    enabled: !!contentId
  });
}
