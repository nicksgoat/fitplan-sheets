
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

export function useUpdateProgramVisibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ programId, isPublic }: { programId: string, isPublic: boolean }) => 
      workoutService.updateProgramVisibility(programId, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success(`Program visibility ${variables.isPublic ? 'made public' : 'made private'}`);
    },
    onError: (error: any) => {
      console.error('Error updating program visibility:', error);
      toast.error(`Error updating program visibility: ${error.message}`);
    }
  });
}

export function useCloneProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (programId: string) => workoutService.cloneProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program cloned successfully');
    },
    onError: (error: any) => {
      console.error('Error cloning program:', error);
      toast.error(`Error cloning program: ${error.message}`);
    }
  });
}

// New monetization hooks
export function useUpdateProgramPrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      programId, 
      price, 
      isPurchasable 
    }: { 
      programId: string, 
      price: number, 
      isPurchasable: boolean 
    }) => workoutService.updateProgramPrice(programId, price, isPurchasable),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', variables.programId] });
      toast.success('Program price updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating program price:', error);
      toast.error(`Error updating program price: ${error.message}`);
    }
  });
}

export function useUpdateWorkoutPrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      workoutId, 
      price, 
      isPurchasable 
    }: { 
      workoutId: string, 
      price: number, 
      isPurchasable: boolean 
    }) => workoutService.updateWorkoutPrice(workoutId, price, isPurchasable),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout price updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating workout price:', error);
      toast.error(`Error updating workout price: ${error.message}`);
    }
  });
}

export function useHasUserPurchasedProgram(userId: string, programId: string) {
  return useQuery({
    queryKey: ['program-purchase', programId, userId],
    queryFn: () => workoutService.hasUserPurchasedProgram(userId, programId),
    enabled: !!userId && !!programId
  });
}

export function useHasUserPurchasedWorkout(userId: string, workoutId: string) {
  return useQuery({
    queryKey: ['workout-purchase', workoutId, userId],
    queryFn: () => workoutService.hasUserPurchasedWorkout(userId, workoutId),
    enabled: !!userId && !!workoutId
  });
}

export function useUserPurchasedPrograms(userId: string) {
  return useQuery({
    queryKey: ['user-purchased-programs', userId],
    queryFn: () => workoutService.getUserPurchasedPrograms(userId),
    enabled: !!userId
  });
}

export function useUserPurchasedWorkouts(userId: string) {
  return useQuery({
    queryKey: ['user-purchased-workouts', userId],
    queryFn: () => workoutService.getUserPurchasedWorkouts(userId),
    enabled: !!userId
  });
}
