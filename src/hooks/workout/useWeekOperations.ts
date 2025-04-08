
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';

export function useAddWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programId, name, orderNum }: { programId: string, name: string, orderNum: number }) => 
      workoutService.addWeek(programId, name, orderNum),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Week added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding week:', error);
      toast.error(`Error adding week: ${error.message}`);
    }
  });
}

export function useUpdateWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ weekId, updates, programId }: { weekId: string, updates: { name?: string, orderNum?: number }, programId: string }) => 
      workoutService.updateWeek(weekId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Week updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating week:', error);
      toast.error(`Error updating week: ${error.message}`);
    }
  });
}

export function useDeleteWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ weekId, programId }: { weekId: string, programId: string }) => 
      workoutService.deleteWeek(weekId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Week deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting week:', error);
      toast.error(`Error deleting week: ${error.message}`);
    }
  });
}
