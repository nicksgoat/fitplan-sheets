// Export specific hooks from their respective files to avoid naming conflicts
import { 
  useAddWorkout, 
  useUpdateWorkout, 
  useDeleteWorkout,
  useUpdateWorkoutPrice,
  useUserPurchasedWorkouts
} from './workout/useWorkoutOperations';

import { 
  usePrograms, 
  useProgram, 
  useCreateProgram, 
  useUpdateProgram, 
  useDeleteProgram, 
  useUpdateProgramVisibility, 
  useCloneProgram,
  useUpdateProgramPrice,
  useUserPurchasedPrograms 
} from './workout/useProgramOperations';
import { useAddWeek, useUpdateWeek, useDeleteWeek } from './workout/useWeekOperations';
import { 
  useAddExercise, 
  useUpdateExercise, 
  useDeleteExercise 
} from './workout/useExerciseOperations';
import { useAddSet, useUpdateSet, useDeleteSet } from './workout/useSetOperations';
import { 
  useAddCircuit, 
  useUpdateCircuit, 
  useDeleteCircuit, 
  useAddExerciseToCircuit, 
  useRemoveExerciseFromCircuit 
} from './workout/useCircuitOperations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClubContentAccess } from './useClubContentAccess';

// Export all workout hooks - using explicit exports to avoid conflicts
export {
  // Program operations
  usePrograms, 
  useProgram, 
  useCreateProgram, 
  useUpdateProgram, 
  useDeleteProgram, 
  useUpdateProgramVisibility, 
  useCloneProgram,
  useUpdateProgramPrice,
  useUserPurchasedPrograms,
  
  // Week operations
  useAddWeek,
  useUpdateWeek,
  useDeleteWeek,
  
  // Workout operations
  useAddWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
  useUpdateWorkoutPrice,
  useUserPurchasedWorkouts,
  
  // Exercise operations
  useAddExercise,
  useUpdateExercise,
  useDeleteExercise,
  
  // Set operations
  useAddSet,
  useUpdateSet,
  useDeleteSet,
  
  // Circuit operations
  useAddCircuit,
  useUpdateCircuit,
  useDeleteCircuit,
  useAddExerciseToCircuit,
  useRemoveExerciseFromCircuit
};

// Define hook for checking workout purchases
export const useHasUserPurchasedWorkout = (userId: string, workoutId: string) => {
  const clubAccess = useClubContentAccess(workoutId, 'workout');

  return useQuery({
    queryKey: ['workout-purchased', userId, workoutId],
    queryFn: async () => {
      if (!userId || !workoutId) {
        console.log('[useHasUserPurchasedWorkout] Missing userId or workoutId', { userId, workoutId });
        return { isPurchased: false };
      }
      
      try {
        console.log('[useHasUserPurchasedWorkout] Checking purchase for', { userId, workoutId });
        const { data, error } = await supabase
          .from('workout_purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('workout_id', workoutId)
          .eq('status', 'completed')
          .maybeSingle();
        
        if (error) {
          console.error('[useHasUserPurchasedWorkout] Error checking workout purchase:', error);
          return { isPurchased: false };
        }

        const isPurchased = !!data;
        console.log('[useHasUserPurchasedWorkout] Purchase check result:', { isPurchased, userId, workoutId });
        return { isPurchased };
      } catch (error) {
        console.error('[useHasUserPurchasedWorkout] Exception in purchase check:', error);
        return { isPurchased: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId && !!workoutId,
    select: (data) => {
      const result = {
        isPurchased: data.isPurchased,
        isClubShared: clubAccess.data?.hasAccess || false,
        sharedWithClubs: clubAccess.data?.sharedWithClubs || []
      };
      console.log('[useHasUserPurchasedWorkout] Final result:', result);
      return result;
    }
  });
};

// Define hook for checking program purchases
export const useHasUserPurchasedProgram = (userId: string, programId: string) => {
  const clubAccess = useClubContentAccess(programId, 'program');
  
  return useQuery({
    queryKey: ['program-purchased', userId, programId],
    queryFn: async () => {
      if (!userId || !programId) return false;
      
      try {
        const { data, error } = await supabase
          .from('program_purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('program_id', programId)
          .eq('status', 'completed')
          .maybeSingle();
        
        if (error) {
          console.error('Error checking program purchase:', error);
          return false;
        }
        
        return !!data;
      } catch (error) {
        console.error('Error in useHasUserPurchasedProgram:', error);
        return false;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId && !!programId,
    select: (hasPurchased) => {
      return {
        isPurchased: hasPurchased,
        isClubShared: clubAccess.data?.hasAccess || false,
        sharedWithClubs: clubAccess.data?.sharedWithClubs || []
      };
    }
  });
};
