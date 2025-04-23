
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkoutProgram } from '@/types/workout';

interface ExerciseSuggestion {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
}

interface CircuitSuggestion {
  name: string;
  exercises: ExerciseSuggestion[];
  rounds: number;
  restBetweenExercises: string;
  restBetweenRounds: string;
}

interface WorkoutSuggestion {
  name: string;
  exercises: ExerciseSuggestion[];
  circuits: CircuitSuggestion[];
  notes?: string;
}

export interface AIWorkoutGeneratorInput {
  goal: string;
  fitnessLevel: string;
  duration: string;
  equipment: string[];
  focusAreas: string[];
  additionalNotes?: string;
}

export interface AIWorkoutToolsInput {
  currentWorkout?: WorkoutProgram;
  userPrompt: string;
}

export function useAIWorkoutGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<WorkoutSuggestion | null>(null);
  
  const generateWorkout = async (input: AIWorkoutGeneratorInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
        body: {
          goal: input.goal,
          fitnessLevel: input.fitnessLevel,
          duration: input.duration,
          equipment: input.equipment,
          focusAreas: input.focusAreas,
          additionalNotes: input.additionalNotes
        }
      });
      
      if (error) throw error;
      
      // Parse the workout suggestion
      const workoutSuggestion: WorkoutSuggestion = data.workout;
      setSuggestion(workoutSuggestion);
      
      return workoutSuggestion;
    } catch (err: any) {
      console.error('Error generating workout:', err);
      setError(err.message || 'Failed to generate workout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetSuggestion = () => {
    setSuggestion(null);
    setError(null);
  };
  
  return {
    generateWorkout,
    resetSuggestion,
    suggestion,
    isLoading,
    error
  };
}

export function useAIWorkoutTools() {
  // Type explicitly the mutation key to fix the deep instantiation error
  const workoutToolsMutation = useMutation({
    mutationKey: ['ai-workout-tools'] as const,
    mutationFn: async (input: AIWorkoutToolsInput) => {
      // Call the Supabase Edge Function to get AI assistance for workout tools
      const { data, error } = await supabase.functions.invoke('ai-workout-tools', {
        body: {
          currentWorkout: input.currentWorkout,
          userPrompt: input.userPrompt
        }
      });
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      // Handle successful response from AI tools
      toast.success('AI suggestion generated');
    },
    onError: (error: any) => {
      // Handle errors
      toast.error(`AI tool error: ${error.message || 'Unknown error'}`);
      console.error('AI workout tools error:', error);
    }
  });

  return {
    getAIWorkoutSuggestion: workoutToolsMutation.mutate,
    aiWorkoutToolsData: workoutToolsMutation.data,
    isLoadingAIWorkoutTools: workoutToolsMutation.isPending,
    aiWorkoutToolsError: workoutToolsMutation.error
  };
}
