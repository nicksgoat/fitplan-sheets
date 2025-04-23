import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Simplified types to avoid deep instantiation
export interface ClubSharePayload {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

// Define separate types for workout and program shares to avoid TypeScript confusion
interface WorkoutShareRecord {
  club_id: string;
  shared_by: string;
  workout_id: string;
}

interface ProgramShareRecord {
  club_id: string;
  shared_by: string;
  program_id: string;
}

export function useShareWithClubs() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ contentId, contentType, clubIds }: ClubSharePayload) => {
      if (!contentId || !contentType || !clubIds.length) {
        throw new Error('Missing required share data');
      }

      setIsLoading(true);
      
      try {
        const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
        const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Delete existing shares
        await supabase.from(table).delete().eq(idField, contentId);
        
        if (clubIds.length > 0) {
          // Create properly typed records based on content type
          if (contentType === 'workout') {
            const sharesToInsert: WorkoutShareRecord[] = clubIds.map(clubId => ({
              club_id: clubId,
              shared_by: user.id,
              workout_id: contentId
            }));
            
            const { error } = await supabase.from('club_shared_workouts').insert(sharesToInsert);
            if (error) throw error;
          } else {
            const sharesToInsert: ProgramShareRecord[] = clubIds.map(clubId => ({
              club_id: clubId,
              shared_by: user.id,
              program_id: contentId
            }));
            
            const { error } = await supabase.from('club_shared_programs').insert(sharesToInsert);
            if (error) throw error;
          }
        }
        
        return { success: true };
      } catch (error: any) {
        console.error('Error sharing with clubs:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success('Content shared with selected clubs');
      queryClient.invalidateQueries({ queryKey: ['club-content'] });
    },
    onError: (error: any) => {
      toast.error(`Error sharing content: ${error.message}`);
    }
  });
  
  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    isLoading: isLoading || mutation.isPending
  };
}

// Keep the original hook for backward compatibility
export function useClubSharing() {
  const shareWithClubsHook = useShareWithClubs();
  
  return {
    shareWithClubs: {
      mutate: shareWithClubsHook.mutate,
      isPending: shareWithClubsHook.isPending
    },
    isLoading: shareWithClubsHook.isLoading
  };
}
