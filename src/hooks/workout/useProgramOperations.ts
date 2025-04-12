import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as workoutService from '@/services/workoutService';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutProgram } from '@/types/workout';

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
      
      return data as WorkoutProgram[];
    }
  });
}

export function useProgram(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as WorkoutProgram;
    },
    enabled: !!programId
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('programs')
        .insert({ name })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as WorkoutProgram;
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
    mutationFn: async ({ programId, name }: { programId: string, name: string }) => {
      const { error } = await supabase
        .from('programs')
        .update({ name })
        .eq('id', programId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
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
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);
      
      if (error) {
        throw error;
      }
    },
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
    mutationFn: async ({ programId, isPublic }: { programId: string, isPublic: boolean }) => {
      const { error } = await supabase
        .from('programs')
        .update({ is_public: isPublic })
        .eq('id', programId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program visibility updated successfully');
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
    mutationFn: async (programId: string) => {
      // Fetch the program to clone
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (programError) {
        throw programError;
      }
      
      // Create a new program with the same data
      const { data: newProgram, error: newProgramError } = await supabase
        .from('programs')
        .insert({
          name: `${program.name} (Clone)`,
          description: program.description,
          is_public: program.is_public
        })
        .select()
        .single();
      
      if (newProgramError) {
        throw newProgramError;
      }
      
      // Fetch weeks for the original program
      const { data: weeks, error: weeksError } = await supabase
        .from('weeks')
        .select('*')
        .eq('program_id', programId);
      
      if (weeksError) {
        throw weeksError;
      }
      
      // Clone each week and its workouts
      for (const week of weeks) {
        const { data: newWeek, error: newWeekError } = await supabase
          .from('weeks')
          .insert({
            program_id: newProgram.id,
            name: week.name,
            order_num: week.order_num
          })
          .select()
          .single();
        
        if (newWeekError) {
          throw newWeekError;
        }
        
        // Fetch workouts for the original week
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('week_id', week.id);
        
        if (workoutsError) {
          throw workoutsError;
        }
        
        // Clone each workout
        for (const workout of workouts) {
          const { data: newWorkout, error: newWorkoutError } = await supabase
            .from('workouts')
            .insert({
              week_id: newWeek.id,
              name: workout.name,
              day_num: workout.day_num
            })
            .select()
            .single();
          
          if (newWorkoutError) {
            throw newWorkoutError;
          }
          
          // TODO: Clone exercises and sets for each workout
        }
      }
      
      return newProgram as WorkoutProgram;
    },
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

// Add the functions for program purchases
export function useUpdateProgramPrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      programId,
      price, 
      isPurchasable
    }: { 
      programId: string, 
      price: number, 
      isPurchasable: boolean 
    }) => {
      const { error } = await supabase
        .from('programs')
        .update({
          price,
          is_purchasable: isPurchasable
        })
        .eq('id', programId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program pricing updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating program pricing:', error);
      toast.error(`Error updating program pricing: ${error.message}`);
    }
  });
}

export function useHasUserPurchasedProgram(userId: string, programId: string) {
  return useQuery({
    queryKey: ['program-purchase', programId, userId],
    queryFn: async () => {
      if (!userId || !programId) return false;
      
      const { count, error } = await supabase
        .from('program_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('program_id', programId)
        .eq('status', 'completed');
      
      if (error) throw error;
      return count > 0;
    },
    enabled: !!userId && !!programId
  });
}

export function useUserPurchasedPrograms(userId: string) {
  return useQuery({
    queryKey: ['user-purchased-programs', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('program_purchases')
        .select('program_id')
        .eq('user_id', userId)
        .eq('status', 'completed');
      
      if (error) throw error;
      return data.map(purchase => purchase.program_id);
    },
    enabled: !!userId
  });
}
