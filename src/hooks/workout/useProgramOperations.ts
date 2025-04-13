import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { WorkoutProgram } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Convert to WorkoutProgram type with empty arrays for workouts and weeks
      return data.map(program => ({
        ...program,
        workouts: [],
        weeks: []
      })) as WorkoutProgram[];
    }
  });
}

export function useProgram(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      // Fetch the program details
      const { data: program, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Fetch the weeks for this program
      const { data: weeksData, error: weeksError } = await supabase
        .from('weeks')
        .select('*')
        .eq('program_id', programId)
        .order('order_num', { ascending: true });
      
      if (weeksError) {
        throw weeksError;
      }
      
      // Map the weeks data to match our WorkoutWeek type
      const mappedWeeks = (weeksData || []).map(week => ({
        id: week.id,
        name: week.name,
        order: week.order_num, // Map order_num to order as expected by WorkoutWeek
        workouts: [], // Initialize empty array for workouts
        savedAt: week.created_at,
        lastModified: week.updated_at
      }));
      
      // Return the full program with empty workouts array for now
      return {
        ...program,
        weeks: mappedWeeks,
        workouts: []
      } as WorkoutProgram;
    },
    enabled: !!programId // Only run if programId exists
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('programs')
        .insert({
          name,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data.id;
    },
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

export function useHasUserPurchasedProgram(userId: string, programId: string) {
  const { data: clubAccess, isLoading: isClubAccessLoading } = useClubContentAccess(programId, 'program');
  
  const { data: purchaseData, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ['program-purchase', programId, userId],
    queryFn: () => workoutService.hasUserPurchasedProgram(userId, programId),
    enabled: !!userId && !!programId && !clubAccess?.hasAccess
  });
  
  return {
    data: purchaseData || clubAccess?.hasAccess,
    isLoading: isPurchaseLoading || isClubAccessLoading,
    isClubShared: clubAccess?.hasAccess || false,
    sharedWithClubs: clubAccess?.sharedWithClubs || []
  };
}

export function useUserPurchasedPrograms(userId: string) {
  return useQuery({
    queryKey: ['user-purchased-programs', userId],
    queryFn: () => workoutService.getUserPurchasedPrograms(userId),
    enabled: !!userId
  });
}
