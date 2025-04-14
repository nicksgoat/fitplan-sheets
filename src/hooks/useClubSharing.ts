
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Club } from '@/types/club';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ShareOptions {
  contentType: 'workout' | 'program';
  contentId: string;
  clubIds: string[];
}

export const useClubSharing = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);

  const loadAvailableClubs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get clubs where user is an admin or moderator
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          id,
          name,
          logo_url,
          description,
          creator_id,
          created_at,
          created_by,
          club_type,
          membership_type
        `)
        .eq('creator_id', user.id);
      
      if (error) throw error;
      
      // Set the available clubs directly from the query
      setAvailableClubs(data as Club[]);
      
    } catch (err) {
      console.error('Error loading clubs:', err);
      toast.error('Failed to load clubs');
    } finally {
      setIsLoading(false);
    }
  };

  const shareWithClubs = async ({ contentType, contentId, clubIds }: ShareOptions) => {
    if (!user || clubIds.length === 0) return { success: false };
    
    setIsLoading(true);
    try {
      const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Prepare inserts for all selected clubs
      const inserts = clubIds.map(clubId => {
        const record: any = {
          club_id: clubId,
          shared_by: user.id
        };
        
        // Add the correct ID field based on content type
        if (contentType === 'workout') {
          record.workout_id = contentId;
        } else {
          record.program_id = contentId;
        }
        
        return record;
      });
      
      // Insert all in one batch
      const { data, error } = await supabase
        .from(table)
        .upsert(inserts, { onConflict: `club_id,${idField}` })
        .select();
      
      if (error) throw error;
      
      toast.success(`Successfully shared with ${clubIds.length} club${clubIds.length > 1 ? 's' : ''}`);
      
      return { success: true, data };
    } catch (err: any) {
      console.error(`Error sharing ${contentType}:`, err);
      toast.error(`Failed to share: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    availableClubs,
    selectedClubs,
    setSelectedClubs,
    loadAvailableClubs,
    shareWithClubs,
  };
};

// Export the hook using react-query for better state management
export const useShareWithClubs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, contentType, clubIds }: ShareOptions) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Determine which table to use based on content type
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Prepare inserts for all selected clubs
      const inserts = clubIds.map(clubId => {
        if (contentType === 'workout') {
          return {
            club_id: clubId,
            shared_by: user.id,
            workout_id: contentId
          };
        } else {
          return {
            club_id: clubId,
            shared_by: user.id,
            program_id: contentId
          };
        }
      });
      
      // Insert all in one batch
      const { error } = await supabase
        .from(tableName)
        .upsert(inserts, { onConflict: `club_id,${idField}` });
        
      if (error) {
        throw new Error(`Failed to share: ${error.message}`);
      }
      
      return clubIds;
    },
    onSuccess: (clubIds) => {
      toast.success(`Successfully shared with ${clubIds.length} club${clubIds.length > 1 ? 's' : ''}`);
      queryClient.invalidateQueries({ queryKey: ['creator-clubs', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share content with clubs');
    }
  });
};
