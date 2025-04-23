
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Use simpler types to avoid excessive type instantiation
export interface ClubSharePayload {
  contentId: string;
  contentType: 'workout' | 'program';
  clubIds: string[];
}

// This is the hook that's being imported in multiple files
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
        // Determine table and fields based on content type
        const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
        const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // First, remove any existing shares for this content
        await supabase.from(table).delete().eq(idField, contentId);
        
        // Then insert new shares
        if (clubIds.length > 0) {
          // Create properly typed records based on content type
          let sharesToInsert = [];
          
          if (contentType === 'workout') {
            sharesToInsert = clubIds.map(clubId => ({
              workout_id: contentId,
              club_id: clubId,
              shared_by: user.id
            }));
          } else {
            // Program type
            sharesToInsert = clubIds.map(clubId => ({
              program_id: contentId,
              club_id: clubId,
              shared_by: user.id
            }));
          }
          
          // Insert the shares
          const { error } = await supabase.from(table).insert(sharesToInsert);
          
          if (error) throw error;
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

// Also export the original hook with a different name for backward compatibility
export function useClubSharing() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const shareWithClubs = useMutation({
    mutationFn: async ({ contentId, contentType, clubIds }: ClubSharePayload) => {
      if (!contentId || !contentType || !clubIds.length) {
        throw new Error('Missing required share data');
      }

      setIsLoading(true);
      
      try {
        // Determine table and fields based on content type
        const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
        const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // First, remove any existing shares for this content
        await supabase.from(table).delete().eq(idField, contentId);
        
        // Then insert new shares
        if (clubIds.length > 0) {
          // Create properly typed records based on content type
          let sharesToInsert = [];
          
          if (contentType === 'workout') {
            sharesToInsert = clubIds.map(clubId => ({
              workout_id: contentId,
              club_id: clubId,
              shared_by: user.id
            }));
          } else {
            // Program type
            sharesToInsert = clubIds.map(clubId => ({
              program_id: contentId,
              club_id: clubId,
              shared_by: user.id
            }));
          }
          
          // Insert the shares
          const { error } = await supabase.from(table).insert(sharesToInsert);
          
          if (error) throw error;
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
    shareWithClubs,
    isLoading: isLoading || shareWithClubs.isPending
  };
}
