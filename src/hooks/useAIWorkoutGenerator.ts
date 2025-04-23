
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WorkoutGenerationParams {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  duration?: number;
  equipment?: string[];
  goals?: string;
  additionalNotes?: string;
}

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  restBetweenSets: string;
  notes: string;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  targetMuscles: string[];
  exercises: GeneratedExercise[];
  created_at?: string;
}

export function useAIWorkoutGenerator() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (params: WorkoutGenerationParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
          body: {
            ...params,
            userId: user.id
          }
        });
        
        if (error) {
          console.error('Error generating workout:', error);
          throw new Error(error.message || 'Failed to generate workout');
        }
        
        if (!data?.workout) {
          throw new Error('No workout was generated');
        }
        
        return data.workout as GeneratedWorkout;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error: Error) => {
      console.error('Workout generation error:', error);
      toast.error(`Failed to generate workout: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Workout generated successfully!');
    }
  });
  
  const saveToWorkout = async (generatedWorkout: GeneratedWorkout) => {
    try {
      // Implementation will be added to convert generated workout to regular workout format
      toast.success('Saving workout to library');
      
      // This is a simplified implementation
      return { success: true, id: generatedWorkout.id };
    } catch (error) {
      console.error('Error saving to workout:', error);
      toast.error('Failed to save workout');
      throw error;
    }
  };

  return {
    generateWorkout: generateMutation.mutate,
    saveToWorkout,
    isGenerating: isGenerating || generateMutation.isPending,
    generatedWorkout: generateMutation.data,
    error: generateMutation.error
  };
}
