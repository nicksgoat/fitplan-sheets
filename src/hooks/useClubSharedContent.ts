
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SharedWorkout {
  id: string;
  workout_id: string;
  shared_by: string;
  created_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  workouts?: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    price?: number;
    is_purchasable?: boolean;
  };
}

interface SharedProgram {
  id: string;
  program_id: string;
  shared_by: string;
  created_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  programs?: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    price?: number;
    is_purchasable?: boolean;
  };
}

export function useClubSharedContent(clubId: string | undefined) {
  const { user } = useAuth();

  // Query for shared workouts
  const {
    data: sharedWorkouts,
    isLoading: workoutsLoading,
    refetch: refetchWorkouts
  } = useQuery({
    queryKey: ['club-shared-workouts', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data, error } = await supabase
        .from('club_shared_workouts')
        .select(`
          id,
          workout_id,
          shared_by,
          created_at,
          profiles:shared_by (username, display_name, avatar_url),
          workouts:workout_id (
            id,
            name,
            slug,
            created_at,
            price,
            is_purchasable
          )
        `)
        .eq('club_id', clubId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clubId && !!user
  });

  // Query for shared programs
  const {
    data: sharedPrograms,
    isLoading: programsLoading,
    refetch: refetchPrograms
  } = useQuery({
    queryKey: ['club-shared-programs', clubId],
    queryFn: async () => {
      if (!clubId) return [];
      
      const { data, error } = await supabase
        .from('club_shared_programs')
        .select(`
          id,
          program_id,
          shared_by,
          created_at,
          profiles:shared_by (username, display_name, avatar_url),
          programs:program_id (
            id,
            name,
            slug,
            created_at,
            price,
            is_purchasable
          )
        `)
        .eq('club_id', clubId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clubId && !!user
  });

  const refreshSharedContent = () => {
    refetchWorkouts();
    refetchPrograms();
  };

  return {
    sharedWorkouts: sharedWorkouts as SharedWorkout[],
    sharedPrograms: sharedPrograms as SharedProgram[],
    workoutsLoading,
    programsLoading,
    refreshSharedContent
  };
}
