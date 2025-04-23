
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, Set } from '@/types/workout';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import { useProgram } from '@/hooks/useWorkoutData';
import { useWorkout } from '@/contexts/WorkoutContext';

export interface WorkoutLogData {
  id: string;
  workoutId?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutLogExercise[];
}

export interface WorkoutLogExercise {
  id: string;
  name: string;
  sets: WorkoutLogSet[];
  notes?: string;
}

export interface WorkoutLogSet {
  id: string;
  reps: string;
  weight: string;
  rest?: string;
  completed: boolean;
}

export function useWorkoutLoggerIntegration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { activeWorkoutId, program } = useWorkout();
  
  // Get active workout from context
  const activeWorkout = activeWorkoutId && program ? 
    program.workouts.find(w => w.id === activeWorkoutId) : 
    undefined;

  console.log('[useWorkoutLoggerIntegration] Active workout:', activeWorkout);
  console.log('[useWorkoutLoggerIntegration] Program workouts:', program?.workouts);
  
  // Start a new workout log session
  const startWorkoutSession = async () => {
    if (!user?.id || !activeWorkoutId) {
      toast.error('Missing required information to start workout');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const currentTime = new Date().toISOString();
      
      console.log('[useWorkoutLoggerIntegration] Starting workout session with data:', {
        user_id: user.id,
        workout_id: activeWorkoutId,
        start_time: currentTime,
        end_time: currentTime, // Temporary end_time that will be updated later
        duration: 0
      });
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: activeWorkoutId,
          start_time: currentTime,
          end_time: currentTime, // Temporary end_time that will be updated later
          duration: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('[useWorkoutLoggerIntegration] Error starting session:', error);
        throw error;
      }
      
      console.log('Workout session started:', data);
      
      return data;
    } catch (error: any) {
      console.error('Error starting workout session:', error);
      toast.error(`Failed to start workout: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Complete workout log
  const completeWorkoutLog = useMutation({
    mutationFn: async (payload: {
      logId: string, 
      duration: number, 
      notes?: string,
      exercises: WorkoutLogExercise[]
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { logId, duration, notes, exercises } = payload;
      
      // Update the workout log with completion details
      const { error: logError } = await supabase
        .from('workout_logs')
        .update({
          duration,
          notes,
          end_time: new Date().toISOString()
        })
        .eq('id', logId);
      
      if (logError) throw logError;

      console.log("Logging exercises:", exercises);
      
      // Record each exercise
      for (const exercise of exercises) {
        const { data: exerciseLog, error: exerciseError } = await supabase
          .from('exercise_logs')
          .insert({
            workout_log_id: logId,
            exercise_id: exercise.id
          })
          .select()
          .single();
        
        if (exerciseError) throw exerciseError;
        
        // Record each set for the exercise
        const setEntries = exercise.sets.map((set, index) => ({
          exercise_log_id: exerciseLog.id,
          set_number: index + 1,
          reps: parseInt(set.reps) || 0,
          weight: set.weight || '',
          rest_time: parseInt(set.rest || '60'),
          notes: exercise.notes || ''
        }));
        
        if (setEntries.length > 0) {
          const { error: setsError } = await supabase
            .from('set_logs')
            .insert(setEntries);
          
          if (setsError) throw setsError;
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      toast.success('Workout logged successfully!');
    },
    onError: (error: any) => {
      console.error('Error logging workout:', error);
      toast.error(`Failed to log workout: ${error.message}`);
    }
  });
  
  // Get user's workout history
  const getWorkoutHistory = () => {
    return useQuery({
      queryKey: ['workout-history', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const { data, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            workout_id,
            duration,
            notes,
            start_time,
            end_time,
            workouts(name)
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!user?.id
    });
  };
  
  return {
    activeWorkout,
    isLoading: isLoading || completeWorkoutLog.isPending,
    startWorkoutSession,
    completeWorkoutLog,
    getWorkoutHistory
  };
}
