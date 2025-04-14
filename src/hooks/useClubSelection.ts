
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Club } from '@/types/clubSharing';

// Define a simpler interface for the Supabase response
interface ClubMemberWithClub {
  club_id: string;
  role: string;
  clubs: Club | null;
}

export function useClubSelection(initialSelectedIds: string[] = []) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    setSelectedClubIds(initialSelectedIds);
  }, [initialSelectedIds]);
  
  const loadUserClubs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get clubs where the user is admin or owner
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          role,
          clubs:clubs(
            id,
            name,
            description,
            logo_url,
            created_at,
            created_by,
            club_type,
            membership_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('role', ['owner', 'admin']);
      
      if (error) throw error;
      
      // Transform the data into Club array
      const userClubs: Club[] = [];
      
      if (data && Array.isArray(data)) {
        // Use explicit type checking to ensure clubs property exists and is valid
        for (const item of data) {
          // Check that clubs is a valid object with expected properties
          const clubData = item.clubs;
          if (clubData && typeof clubData === 'object' && 'id' in clubData && 'name' in clubData) {
            userClubs.push({
              id: clubData.id,
              name: clubData.name,
              description: clubData.description || undefined,
              logo_url: clubData.logo_url || undefined,
              created_at: clubData.created_at,
              created_by: clubData.created_by,
              club_type: clubData.club_type,
              membership_type: clubData.membership_type
            });
          }
        }
      }
      
      setClubs(userClubs);
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load your clubs");
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const toggleClub = useCallback((clubId: string) => {
    const newSelection = selectedClubIds.includes(clubId)
      ? selectedClubIds.filter(id => id !== clubId)
      : [...selectedClubIds, clubId];
    
    setSelectedClubIds(newSelection);
    return newSelection;
  }, [selectedClubIds]);
  
  return {
    clubs,
    selectedClubIds,
    setSelectedClubIds,
    isLoading,
    loadUserClubs,
    toggleClub
  };
}
