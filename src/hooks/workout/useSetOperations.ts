
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { Set } from '@/types/workout';

export function useAddSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ exerciseId, set, programId }: { exerciseId: string, set: Partial<Set>, programId: string }) => 
      workoutService.addSet(exerciseId, set),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Set added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding set:', error);
      toast.error(`Error adding set: ${error.message}`);
    }
  });
}

export function useUpdateSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ setId, updates, programId }: { setId: string, updates: Partial<Set>, programId: string }) => 
      workoutService.updateSet(setId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Set updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating set:', error);
      toast.error(`Error updating set: ${error.message}`);
    }
  });
}

export function useDeleteSet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ setId, programId }: { setId: string, programId: string }) => 
      workoutService.deleteSet(setId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Set deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting set:', error);
      toast.error(`Error deleting set: ${error.message}`);
    }
  });
}
