
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { Exercise } from '@/types/workout';

export function useAddExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, exercise, programId }: { workoutId: string, exercise: Partial<Exercise>, programId: string }) => 
      workoutService.addExercise(workoutId, exercise),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Exercise added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding exercise:', error);
      toast.error(`Error adding exercise: ${error.message}`);
    }
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ exerciseId, updates, programId }: { exerciseId: string, updates: Partial<Exercise>, programId: string }) => 
      workoutService.updateExercise(exerciseId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Exercise updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating exercise:', error);
      toast.error(`Error updating exercise: ${error.message}`);
    }
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ exerciseId, programId }: { exerciseId: string, programId: string }) => 
      workoutService.deleteExercise(exerciseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Exercise deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting exercise:', error);
      toast.error(`Error deleting exercise: ${error.message}`);
    }
  });
}
