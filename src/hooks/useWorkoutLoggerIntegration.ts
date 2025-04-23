
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, Set } from '@/types/workout';
import { useWorkoutDetail } from '@/hooks/useWorkoutDetail';
import { useWorkout } from '@/contexts/WorkoutContext';
import { getOrganizedExercises } from '@/utils/workoutPreviewUtils';
import { WorkoutLogData, WorkoutLogExercise, WorkoutLogSet } from '@/types/workoutLog';

export function useWorkoutLoggerIntegration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { program, activeWorkoutId } = useWorkout();
  
  // Get active workout from context
  const activeWorkout = activeWorkoutId && program ? 
    program.workouts.find(w => w.id === activeWorkoutId) : 
    undefined;

  // Start a new workout log session
  const startWorkoutSession = async () => {
    if (!user?.id || !activeWorkoutId) {
      toast.error('Missing required information to start workout');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const currentTime = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: activeWorkoutId,
          start_time: currentTime,
          end_time: currentTime,
          duration: 0
        })
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error starting workout session:', error);
      toast.error(error.message);
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

      // Process exercises and their sets with circuit awareness
      for (const exercise of exercises) {
        // Create the exercise log entry
        const { data: exerciseLog, error: exerciseError } = await supabase
          .from('exercise_logs')
          .insert({
            workout_log_id: logId,
            exercise_id: exercise.id,
            is_circuit: exercise.isCircuit || false,
            circuit_id: exercise.circuitId || null,
            is_in_circuit: exercise.isInCircuit || false,
            notes: exercise.notes || ''
          })
          .select()
          .single();
        
        if (exerciseError) throw exerciseError;
        
        // Handle sets
        const setEntries = exercise.sets.map((set, index) => ({
          exercise_log_id: exerciseLog.id,
          set_number: index + 1,
          reps: parseInt(set.reps) || 0,
          weight: set.weight || '',
          rest_time: parseInt(set.rest || '60'),
          is_completed: set.completed || false
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
