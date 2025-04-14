
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Club } from '@/types/club';

interface ShareOptions {
  contentType: 'workout' | 'program';
  contentId: string;
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
      const { data: clubsData, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          role,
          clubs:club_id (
            id,
            name,
            logo_url,
            description,
            creator_id
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator', 'owner']);
      
      if (error) throw error;
      
      // Format clubs data
      const formatted = clubsData
        .filter(item => item.clubs) // Filter out any null clubs
        .map(item => ({
          id: item.clubs!.id,
          name: item.clubs!.name,
          logo_url: item.clubs!.logo_url,
          description: item.clubs!.description,
          creator_id: item.clubs!.creator_id,
          role: item.role
        }));
      
      setAvailableClubs(formatted);
    } catch (err) {
      console.error('Error loading clubs:', err);
      toast.error('Failed to load clubs');
    } finally {
      setIsLoading(false);
    }
  };

  const shareWithClubs = async ({ contentType, contentId }: ShareOptions) => {
    if (!user || selectedClubs.length === 0) return { success: false };
    
    setIsLoading(true);
    try {
      const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Prepare inserts for all selected clubs
      const inserts = selectedClubs.map(clubId => ({
        club_id: clubId,
        shared_by: user.id,
        [idField]: contentId
      }));
      
      // Insert all in one batch
      const { data, error } = await supabase
        .from(table)
        .upsert(inserts, { onConflict: `club_id,${idField}` })
        .select();
      
      if (error) throw error;
      
      toast.success(`Successfully shared with ${selectedClubs.length} club${selectedClubs.length > 1 ? 's' : ''}`);
      
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
