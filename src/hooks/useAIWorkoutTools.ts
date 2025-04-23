import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Workout, Exercise } from '@/types/workout';
import { GeneratedWorkout, GeneratedExercise } from '@/hooks/useAIWorkoutGenerator';

export interface FileUpload {
  file: File;
  content: string;
}

export interface AIResponse {
  workout: {
    exercises: Array<{
      name: string;
      sets: Array<{
        reps: number;
        weight?: string;
        rest?: number;
      }>;
    }>;
    name: string;
    description?: string;
  };
}

export function useAIWorkoutTools() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null);
  
  const generateFromHistoryMutation = useMutation({
    mutationFn: async (workoutHistory: Workout[]) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
          body: {
            userId: user.id,
            type: 'history',
            workoutHistory
          }
        });
        
        if (error) {
          console.error('Error generating workout from history:', error);
          throw new Error(error.message || 'Failed to generate workout from history');
        }
        
        if (!data?.workout) {
          throw new Error('No workout was generated from history');
        }
        
        return data.workout as GeneratedWorkout;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error: Error) => {
      console.error('Workout generation from history error:', error);
      toast.error(`Failed to generate workout: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Workout generated successfully from history!');
    }
  });
  
  const processUploadMutation = useMutation({
    mutationFn: async (fileUpload: FileUpload) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
          body: {
            userId: user.id,
            type: 'content',
            content: fileUpload.content,
            contentType: fileUpload.file.type
          }
        });
        
        if (error) {
          console.error('Error processing uploaded content:', error);
          throw new Error(error.message || 'Failed to process uploaded content');
        }
        
        if (!data?.workout) {
          throw new Error('No workout was extracted from the content');
        }
        
        return data.workout as GeneratedWorkout;
      } finally {
        setIsGenerating(false);
      }
    },
    onError: (error: Error) => {
      console.error('Content processing error:', error);
      toast.error(`Failed to process content: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Content processed and workout extracted successfully!');
    }
  });

  const handleFileUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const content = e.target.result as string;
          setUploadedFile({ file, content });
          resolve();
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };
  
  const convertToPlatformFormat = (generatedWorkout: GeneratedWorkout): Workout => {
    const platformExercises: Exercise[] = generatedWorkout.exercises.map((ex: GeneratedExercise) => {
      const sets = Array.from({ length: ex.sets || 1 }, () => ({
        id: crypto.randomUUID(),
        reps: ex.reps || "",
        weight: "",
        intensity: "",
        rest: ex.restBetweenSets || ""
      }));
      
      return {
        id: crypto.randomUUID(),
        name: ex.name,
        sets,
        notes: ex.notes || "",
      };
    });

    return {
      id: crypto.randomUUID(),
      name: generatedWorkout.name,
      day: 1, // Default day
      exercises: platformExercises,
      circuits: [],
    };
  };

  const getRecentWorkouts = () => {
    return useQuery({
      queryKey: ['recent-workouts', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id
    });
  };

  const generateWorkout = async (prompt: string): Promise<AIResponse> => {
    try {
      const response = await supabase.functions.invoke('generate-ai-workout', {
        body: { prompt }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as AIResponse;
    } catch (error) {
      console.error('Error generating workout:', error);
      throw error;
    }
  };

  return {
    generateFromHistory: generateFromHistoryMutation.mutate,
    processUpload: processUploadMutation.mutate,
    handleFileUpload,
    convertToPlatformFormat,
    getRecentWorkouts,
    uploadedFile,
    generatedWorkoutFromHistory: generateFromHistoryMutation.data,
    generatedWorkoutFromUpload: processUploadMutation.data,
    isGenerating: isGenerating || generateFromHistoryMutation.isPending || processUploadMutation.isPending,
    historyError: generateFromHistoryMutation.error,
    uploadError: processUploadMutation.error,
    generateWorkout
  };
}
