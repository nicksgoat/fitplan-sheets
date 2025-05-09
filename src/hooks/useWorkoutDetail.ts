
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
  slug: string;
  exercises: {
    id: string;
    name: string;
    notes: string;
    sets: any[];
  }[];
  weeks?: {
    programs?: {
      user_id: string;
    };
  };
}

interface CreatorInfo {
  name: string;
  username?: string;
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
      setLoading(false);
      return;
    }
    
    console.log(`Fetching workout details for ID: ${id}`);
    
    const fetchWorkout = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            exercises:exercises(
              id, name, notes,
              sets:exercise_sets(*)
            ),
            weeks:weeks(
              programs:programs(
                user_id
              )
            )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          console.error(`Workout not found with ID: ${id}`);
          setError(`Workout not found`);
          setLoading(false);
          return;
        }
        
        console.log('Workout data retrieved:', data);
        
        const workoutData = data as unknown as WorkoutDataFromDB;
        // Safely access the creator ID from nested data
        const creatorId = workoutData.weeks?.programs?.user_id || workoutData.user_id;
        
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
          creatorId: creatorId,
          slug: workoutData.slug
        };
        
        setWorkout(mappedWorkout);
        
        // Fetch creator info if available
        if (creatorId) {
          console.log(`Fetching creator info for user ID: ${creatorId}`);
          const { data: creatorData, error: creatorError } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', creatorId)
            .maybeSingle();
            
          if (creatorError) {
            console.error('Error fetching creator info:', creatorError);
          } else if (creatorData) {
            console.log('Creator info retrieved:', creatorData);
            setCreatorInfo({
              name: creatorData.display_name || creatorData.username || 'FitBloom User',
              username: creatorData.username
            });
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching workout:', err);
        setError('Error loading workout');
        toast.error(`Error loading workout: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id]);

  return { workout, loading, error, creatorInfo };
};
