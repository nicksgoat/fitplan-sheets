
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Club } from '@/types/club';
import { useAuth } from '@/hooks/useAuth';

export function useClubSelection(
  initialSelectedClubIds: string[] = [],
  contentId?: string,
  contentType?: 'workout' | 'program'
) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedClubIds);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user } = useAuth();

  // Load user clubs
  const loadUserClubs = async () => {
    if (!user) {
      setIsLoading(false);
      return [];
    }

    try {
      setIsLoading(true);
      
      // Get clubs where the user is an admin/owner/creator
      const { data: userClubs, error } = await supabase
        .from('clubs')
        .select(`
          id, name, description, created_at, updated_at,
          banner_url, logo_url, club_type, membership_type, premium_price, creator_id
        `)
        .eq('creator_id', user.id);
      
      if (error) throw error;
      
      // Also get clubs where user is admin or moderator
      const { data: memberClubs, error: memberError } = await supabase
        .from('club_members')
        .select(`
          clubs (
            id, name, description, created_at, updated_at,
            banner_url, logo_url, club_type, membership_type, premium_price, creator_id
          )
        `)
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator', 'owner'])
        .not('clubs', 'is', null);
      
      if (memberError) throw memberError;
      
      // Cast the data to ensure TypeScript recognizes it properly
      const memberClubsList = memberClubs
        .filter(item => item.clubs)
        .map(item => item.clubs as Club);
      
      // Combine and deduplicate clubs
      const allClubs = [...(userClubs || []), ...memberClubsList];
      
      // Remove duplicates
      const uniqueClubsMap = new Map<string, Club>();
      allClubs.forEach(club => {
        if (club && club.id && !uniqueClubsMap.has(club.id)) {
          uniqueClubsMap.set(club.id, club);
        }
      });
      
      const uniqueClubs = Array.from(uniqueClubsMap.values());
      setClubs(uniqueClubs);
      return uniqueClubs;
    } catch (error) {
      console.error('Error loading clubs:', error);
      setIsError(true);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle club selection
  const toggleClub = (clubId: string) => {
    setSelectedClubIds(prevSelected => {
      if (prevSelected.includes(clubId)) {
        return prevSelected.filter(id => id !== clubId);
      } else {
        return [...prevSelected, clubId];
      }
    });
    
    // Return the updated selection for convenience
    return selectedClubIds.includes(clubId)
      ? selectedClubIds.filter(id => id !== clubId)
      : [...selectedClubIds, clubId];
  };

  useEffect(() => {
    loadUserClubs();
  }, [user?.id]);

  // If initial selection changes externally, update state
  useEffect(() => {
    if (initialSelectedClubIds.length > 0 && 
        JSON.stringify(initialSelectedClubIds) !== JSON.stringify(selectedClubIds)) {
      setSelectedClubIds(initialSelectedClubIds);
    }
  }, [JSON.stringify(initialSelectedClubIds)]);

  return {
    clubs,
    selectedClubIds,
    setSelectedClubIds,
    isLoading,
    isError,
    toggleClub,
    loadUserClubs
  };
}
