
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Club } from '@/types/club';

export function useClubSelection(initialSelectedClubIds: string[] = [], contentId?: string, contentType?: 'workout' | 'program') {
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedClubIds);
  const { user } = useAuth();

  // Update local state when initialSelectedClubIds prop changes
  useEffect(() => {
    if (initialSelectedClubIds && initialSelectedClubIds.length > 0) {
      setSelectedClubIds(initialSelectedClubIds);
    }
  }, [initialSelectedClubIds]);

  // Fetch clubs where user is creator
  const { data: clubs, isLoading, isError } = useQuery<Club[]>({
    queryKey: ['creator-clubs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as Club[];

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
      }
      
      // Safely cast data to Club[] type
      return Array.isArray(data) ? data as Club[] : [];
    },
    enabled: !!user?.id
  });

  const toggleClub = (clubId: string) => {
    setSelectedClubIds(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  // Load clubs and initial shared clubs - ensure this returns string[] for the selected IDs
  const loadUserClubs = async (): Promise<Club[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      // Get clubs where user is creator/admin
      const { data: userClubs, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);

      if (error) throw error;

      // Safely cast and return clubs
      return Array.isArray(userClubs) ? userClubs as Club[] : [];
    } catch (error) {
      console.error('Error loading clubs:', error);
      return [];
    }
  };

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
