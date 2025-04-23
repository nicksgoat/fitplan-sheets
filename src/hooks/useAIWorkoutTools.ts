
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkoutProgram } from '@/types/workout';
import { GeneratedWorkout } from '@/hooks/useAIWorkoutGenerator';

export interface FileUpload {
  file: File;
  content: string;
}

interface ExerciseSuggestion {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
  notes?: string;
  restBetweenSets?: string;
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
  description?: string;
  difficulty?: string;
  duration?: number;
  targetMuscles?: string[];
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
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkoutFromHistory, setGeneratedWorkoutFromHistory] = useState<GeneratedWorkout | null>(null);
  const [generatedWorkoutFromUpload, setGeneratedWorkoutFromUpload] = useState<GeneratedWorkout | null>(null);
  
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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      setUploadedFile({ file, content: text });
      return { file, content: text };
    } catch (err: any) {
      console.error('Error reading file:', err);
      throw new Error('Failed to read file content');
    }
  };
  
  // Process uploaded file content
  const processUpload = async (fileUpload: FileUpload) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-tools', {
        body: {
          fileContent: fileUpload.content,
          fileName: fileUpload.file.name,
          action: 'parse_document'
        }
      });
      
      if (error) throw error;
      
      if (data?.workout) {
        setGeneratedWorkoutFromUpload(data.workout as GeneratedWorkout);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error processing document:', err);
      toast.error(`Failed to process document: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate workout from history
  const generateFromHistory = async (workouts: any[]) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-tools', {
        body: {
          workoutHistory: workouts,
          action: 'analyze_history'
        }
      });
      
      if (error) throw error;
      
      if (data?.workout) {
        setGeneratedWorkoutFromHistory(data.workout as GeneratedWorkout);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error analyzing workout history:', err);
      toast.error(`Failed to generate from history: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Convert generated workout to platform format
  const convertToPlatformFormat = (generatedWorkout: GeneratedWorkout) => {
    // Implement conversion logic here
    // This is a simplified version just for demonstration
    return {
      id: generatedWorkout.id,
      name: generatedWorkout.name,
      exercises: generatedWorkout.exercises.map((ex) => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: Array(ex.sets).fill(0).map(() => ({
          id: crypto.randomUUID(),
          reps: ex.reps,
          weight: '',
          rest: ex.restBetweenSets
        })),
        notes: ex.notes || ''
      })),
      circuits: []
    };
  };

  return {
    getAIWorkoutSuggestion: workoutToolsMutation.mutate,
    aiWorkoutToolsData: workoutToolsMutation.data,
    isLoadingAIWorkoutTools: workoutToolsMutation.isPending,
    aiWorkoutToolsError: workoutToolsMutation.error,
    handleFileUpload,
    processUpload,
    generateFromHistory,
    convertToPlatformFormat,
    uploadedFile,
    generatedWorkoutFromHistory,
    generatedWorkoutFromUpload,
    isGenerating
  };
}
