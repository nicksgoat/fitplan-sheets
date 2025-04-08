
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { WorkoutProgram } from '@/types/workout';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: workoutService.getPrograms
  });
}

export function useProgram(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: () => workoutService.getProgram(programId),
    enabled: !!programId // Only run if programId exists
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => workoutService.createProgram(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating program:', error);
      toast.error(`Error creating program: ${error.message}`);
    }
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programId, name }: { programId: string, name: string }) => 
      workoutService.updateProgram(programId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Program updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating program:', error);
      toast.error(`Error updating program: ${error.message}`);
    }
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (programId: string) => workoutService.deleteProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting program:', error);
      toast.error(`Error deleting program: ${error.message}`);
    }
  });
}
