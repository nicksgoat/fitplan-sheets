
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { WorkoutProgram, Workout, Exercise, Set } from '@/types/workout';

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
