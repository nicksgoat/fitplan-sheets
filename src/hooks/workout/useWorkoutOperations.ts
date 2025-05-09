import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { WorkoutProgram } from '@/types/workout';
import { useClubContentAccess } from '@/hooks/useClubContentAccess';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout pricing updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating workout pricing:', error);
      toast.error(`Error updating workout pricing: ${error.message}`);
    }
  });
}

export function useHasUserPurchasedWorkout(userId: string, workoutId: string) {
  const { data: clubAccess, isLoading: isClubAccessLoading } = useClubContentAccess(workoutId, 'workout');
  
  const { data: purchaseData, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ['workout-purchase', workoutId, userId],
    queryFn: () => workoutService.hasUserPurchasedWorkout(userId, workoutId),
    enabled: !!userId && !!workoutId && !clubAccess?.hasAccess
  });
  
  return {
    data: purchaseData || clubAccess?.hasAccess,
    isLoading: isPurchaseLoading || isClubAccessLoading,
    isClubShared: clubAccess?.hasAccess || false,
    sharedWithClubs: clubAccess?.sharedWithClubs || []
  };
}

export function useUserPurchasedWorkouts(userId: string) {
  return useQuery({
    queryKey: ['user-purchased-workouts', userId],
    queryFn: () => workoutService.getUserPurchasedWorkouts(userId),
    enabled: !!userId
  });
}
