
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Workout, Exercise, Set } from '@/types/workout';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import { useProgram } from '@/hooks/useWorkoutData';

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

export function useWorkoutLoggerIntegration(workoutId?: string, programId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch workout details if workoutId is provided
  const { workout, loading: workoutLoading } = useWorkoutDetail(workoutId || null);
  
  // Fetch program details if programId is provided
  const programQuery = useProgram(programId || '');
  
  // Start a new workout log session
  const startWorkoutSession = async (workout: Workout) => {
    if (!user?.id) {
      toast.error('You must be logged in to start a workout');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
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
      
      // 1. Update the workout log with completion details
      const { error: logError } = await supabase
        .from('workout_logs')
        .update({
          duration,
          notes,
          end_time: new Date().toISOString()
        })
        .eq('id', logId);
      
      if (logError) throw logError;
      
      // 2. Record each exercise
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
        
        // 3. Record each set for the exercise
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
    workout,
    workoutLoading,
    program: programQuery.data,
    programLoading: programQuery.isLoading,
    startWorkoutSession,
    completeWorkoutLog,
    isLoading: isLoading || workoutLoading || completeWorkoutLog.isPending,
    getWorkoutHistory
  };
}
