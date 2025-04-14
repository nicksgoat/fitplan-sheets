
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
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
      return (data || []) as Club[];
    },
    enabled: !!user?.id
  });

  const handleCheckboxChange = (clubId: string) => {
    setSelectedClubIds(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  return {
    selectedClubIds,
    setSelectedClubIds,
    clubs,
    isLoading,
    isError,
    handleCheckboxChange
  };
}
