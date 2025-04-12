
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workout } from '@/types/workout';
import { toast } from 'sonner';

interface WorkoutDataFromDB {
  id: string;
  name: string;
  day_num: number;
  created_at: string;
  updated_at: string;
  is_purchasable: boolean;
  price: number;
  week_id: string;
  user_id: string;
  exercises: {
    id: string;
    name: string;
    notes: string;
    sets: any[];
  }[];
}

interface CreatorInfo {
  name: string;
}

interface UseWorkoutDetailReturn {
  workout: Workout | null;
  loading: boolean;
  error: string | null;
  creatorInfo: CreatorInfo | null;
}

export const useWorkoutDetail = (id: string | null): UseWorkoutDetailReturn => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid workout ID');
      setLoading(false);
      return;
    }
    
    const fetchWorkout = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises:exercises(
              id, name, notes,
              sets:exercise_sets(*)
            )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          setError(`Workout not found: ${id}`);
          setLoading(false);
          return;
        }
        
        const workoutData = data as unknown as WorkoutDataFromDB;
        
        const mappedWorkout: Workout = {
          id: workoutData.id,
          name: workoutData.name,
          day: workoutData.day_num,
          exercises: workoutData.exercises || [],
          circuits: [],
          savedAt: workoutData.created_at,
          lastModified: workoutData.updated_at,
          isPurchasable: workoutData.is_purchasable || false,
          price: workoutData.price || 0,
          creatorId: workoutData.user_id
        };
        
        setWorkout(mappedWorkout);
        
        // Fetch creator info if available
        if (workoutData.user_id) {
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', workoutData.user_id)
            .maybeSingle();
            
          if (creatorData) {
            setCreatorInfo({
              name: creatorData.display_name || creatorData.username || 'FitBloom User'
            });
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching workout:', err);
        setError(err.message || 'Failed to load workout');
        toast.error(`Error loading workout: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id]);

  return { workout, loading, error, creatorInfo };
};
