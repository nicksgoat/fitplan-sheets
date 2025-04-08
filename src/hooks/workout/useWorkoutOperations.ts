
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';

export function useAddWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ weekId, name, dayNum, programId }: { weekId: string, name: string, dayNum: number, programId: string }) => 
      workoutService.addWorkout(weekId, name, dayNum),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Workout added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding workout:', error);
      toast.error(`Error adding workout: ${error.message}`);
    }
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, updates, programId }: { workoutId: string, updates: { name?: string, dayNum?: number }, programId: string }) => 
      workoutService.updateWorkout(workoutId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Workout updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating workout:', error);
      toast.error(`Error updating workout: ${error.message}`);
    }
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, programId }: { workoutId: string, programId: string }) => 
      workoutService.deleteWorkout(workoutId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Workout deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting workout:', error);
      toast.error(`Error deleting workout: ${error.message}`);
    }
  });
}
