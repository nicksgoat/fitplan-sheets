
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { Circuit } from '@/types/workout';

export function useAddCircuit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, circuit, programId }: { workoutId: string, circuit: Partial<Circuit>, programId: string }) => 
      workoutService.addCircuit(workoutId, circuit),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Circuit added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding circuit:', error);
      toast.error(`Error adding circuit: ${error.message}`);
    }
  });
}

export function useUpdateCircuit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ circuitId, updates, programId }: { circuitId: string, updates: Partial<Circuit>, programId: string }) => 
      workoutService.updateCircuit(circuitId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Circuit updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating circuit:', error);
      toast.error(`Error updating circuit: ${error.message}`);
    }
  });
}

export function useDeleteCircuit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ circuitId, programId }: { circuitId: string, programId: string }) => 
      workoutService.deleteCircuit(circuitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Circuit deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting circuit:', error);
      toast.error(`Error deleting circuit: ${error.message}`);
    }
  });
}

export function useAddExerciseToCircuit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ circuitId, exerciseId, orderNum, programId }: 
      { circuitId: string, exerciseId: string, orderNum: number, programId: string }) => 
      workoutService.addExerciseToCircuit(circuitId, exerciseId, orderNum),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Exercise added to circuit successfully');
    },
    onError: (error: any) => {
      console.error('Error adding exercise to circuit:', error);
      toast.error(`Error adding exercise to circuit: ${error.message}`);
    }
  });
}

export function useRemoveExerciseFromCircuit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ circuitId, exerciseId, programId }: { circuitId: string, exerciseId: string, programId: string }) => 
      workoutService.removeExerciseFromCircuit(circuitId, exerciseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Exercise removed from circuit successfully');
    },
    onError: (error: any) => {
      console.error('Error removing exercise from circuit:', error);
      toast.error(`Error removing exercise from circuit: ${error.message}`);
    }
  });
}
