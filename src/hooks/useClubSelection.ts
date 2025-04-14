
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Club } from '@/types/clubSharing';

// Define type for club member query result
interface ClubMemberQueryResult {
  club_id: string;
  role: string;
  clubs: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
  } | null;
}

export function useClubSelection(initialSelectedIds: string[] = []) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    setSelectedClubIds(initialSelectedIds);
  }, [initialSelectedIds]);
  
  const loadUserClubs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get clubs where the user is admin or owner
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          role,
          clubs:club_id(
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('role', ['owner', 'admin']);
      
      if (error) throw error;
      
      // Transform the data into Club array
      const userClubs: Club[] = [];
      
      if (data && Array.isArray(data)) {
        // Type assertion to avoid deep instantiation issues
        const typedData = data as ClubMemberQueryResult[];
        
        typedData.forEach(item => {
          if (item.clubs) {
            const club: Club = {
              id: item.clubs.id,
              name: item.clubs.name,
              description: item.clubs.description,
              logo_url: item.clubs.logo_url
            };
            userClubs.push(club);
          }
        });
      }
      
      setClubs(userClubs);
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load your clubs");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleClub = (clubId: string) => {
    const newSelection = selectedClubIds.includes(clubId)
      ? selectedClubIds.filter(id => id !== clubId)
      : [...selectedClubIds, clubId];
    
    setSelectedClubIds(newSelection);
    return newSelection;
  };
  
  return {
    clubs,
    selectedClubIds,
    setSelectedClubIds,
    isLoading,
    loadUserClubs,
    toggleClub
  };
}
