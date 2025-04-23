
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SharedWorkout {
  id: string;
  club_id: string;
  workout_id: string;
  shared_by: string;
  created_at: string;
  workouts?: {
    name: string;
    is_purchasable?: boolean;
    price?: number;
  };
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface SharedProgram {
  id: string;
  club_id: string;
  program_id: string;
  shared_by: string;
  created_at: string;
  programs?: {
    name: string;
    is_purchasable?: boolean;
    price?: number;
  };
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export function useClubSharedContent(clubId: string) {
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([]);
  const [sharedPrograms, setSharedPrograms] = useState<SharedProgram[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSharedWorkouts = async () => {
      try {
        setWorkoutsLoading(true);
        const { data, error } = await supabase
          .from('club_shared_workouts')
          .select(`
            id, club_id, workout_id, shared_by, created_at,
            workouts:workout_id ( name, is_purchasable, price ),
            profiles:shared_by ( display_name, username, avatar_url )
          `)
          .eq('club_id', clubId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Process data to ensure it matches the SharedWorkout type
        const processedData: SharedWorkout[] = (data || []).map(item => ({
          id: item.id,
          club_id: item.club_id,
          workout_id: item.workout_id,
          shared_by: item.shared_by,
          created_at: item.created_at,
          workouts: item.workouts,
          // Handle cases where profile data might be missing or have errors
          profiles: typeof item.profiles === 'object' ? item.profiles : {
            display_name: 'Unknown',
            username: 'member',
            avatar_url: undefined
          }
        }));
        
        setSharedWorkouts(processedData);
      } catch (err) {
        console.error('Error fetching shared workouts:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setWorkoutsLoading(false);
      }
    };

    const fetchSharedPrograms = async () => {
      try {
        setProgramsLoading(true);
        const { data, error } = await supabase
          .from('club_shared_programs')
          .select(`
            id, club_id, program_id, shared_by, created_at,
            programs:program_id ( name, is_purchasable, price ),
            profiles:shared_by ( display_name, username, avatar_url )
          `)
          .eq('club_id', clubId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Process data to ensure it matches the SharedProgram type
        const processedData: SharedProgram[] = (data || []).map(item => ({
          id: item.id,
          club_id: item.club_id,
          program_id: item.program_id,
          shared_by: item.shared_by,
          created_at: item.created_at,
          programs: item.programs,
          // Handle cases where profile data might be missing or have errors
          profiles: typeof item.profiles === 'object' ? item.profiles : {
            display_name: 'Unknown',
            username: 'member',
            avatar_url: undefined
          }
        }));
        
        setSharedPrograms(processedData);
      } catch (err) {
        console.error('Error fetching shared programs:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setProgramsLoading(false);
      }
    };

    if (clubId) {
      fetchSharedWorkouts();
      fetchSharedPrograms();
    }
  }, [clubId]);

  return {
    sharedWorkouts,
    sharedPrograms,
    workoutsLoading,
    programsLoading,
    error,
    isLoading: workoutsLoading || programsLoading
  };
}
