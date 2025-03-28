import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, ExerciseVisual, ExerciseWithVisual } from '@/types/exercise';
import * as exerciseLibraryService from '@/services/exerciseLibraryService';
import * as exerciseVisualsService from '@/services/exerciseVisualsService';
import { toast } from 'sonner';

// Hook for searching exercises
export function useSearchExercises() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchExercises = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await exerciseLibraryService.searchExercises(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching exercises:', error);
        toast.error('Failed to search exercises. Using local data.');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  return { 
    query, 
    setQuery, 
    searchResults, 
    loading 
  };
}

// Hook for fetching all exercises
export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseLibraryService.getAllExercises,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching exercises:', error);
        toast.error('Failed to fetch exercises. Using local data.');
      }
    }
  });
}

// Hook for fetching a single exercise by ID
export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseLibraryService.getExerciseById(id),
    enabled: !!id,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error(`Error fetching exercise ${id}:`, error);
        toast.error('Failed to fetch exercise details. Using local data if available.');
      }
    }
  });
}

// Hook for fetching all exercise visuals
export function useExerciseVisuals() {
  return useQuery({
    queryKey: ['exerciseVisuals'],
    queryFn: exerciseVisualsService.getAllExerciseVisuals,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching exercise visuals:', error);
        toast.error('Failed to fetch exercise visuals. Using default images.');
      }
    }
  });
}

// Hook for fetching exercise visuals by tags
export function useExerciseVisualsByTags(tags: string[]) {
  return useQuery({
    queryKey: ['exerciseVisuals', 'tags', ...tags],
    queryFn: () => exerciseVisualsService.getExerciseVisualsByTags(tags),
    enabled: tags.length > 0,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching exercise visuals by tags:', error);
        toast.error('Failed to filter exercises by tags. Using default images.');
      }
    }
  });
}

// Hook for fetching exercises with their visuals
export function useExercisesWithVisuals() {
  const exercisesQuery = useExercises();
  const visualsQuery = useExerciseVisuals();
  
  const isLoading = exercisesQuery.isLoading || visualsQuery.isLoading;
  const error = exercisesQuery.error || visualsQuery.error;
  
  const exercisesWithVisuals: ExerciseWithVisual[] = [];
  
  if (exercisesQuery.data) {
    const visualsMap = new Map<string, ExerciseVisual>();
    
    if (visualsQuery.data) {
      visualsQuery.data.forEach(visual => {
        visualsMap.set(visual.exerciseId, visual);
      });
    }
    
    exercisesQuery.data.forEach(exercise => {
      exercisesWithVisuals.push({
        ...exercise,
        visual: visualsMap.get(exercise.id)
      });
    });
  }
  
  return {
    data: exercisesWithVisuals,
    isLoading,
    error
  };
}

// Hook for creating a custom exercise
export function useCreateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (exercise: Omit<Exercise, 'id'>) => 
      exerciseLibraryService.addCustomExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating exercise:', error);
      toast.error(`Error creating exercise: ${error.message}`);
    }
  });
}

// Hook for updating a custom exercise
export function useUpdateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, exercise }: { id: string, exercise: Partial<Exercise> }) => 
      exerciseLibraryService.updateCustomExercise(id, exercise),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise', variables.id] });
      toast.success('Exercise updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating exercise:', error);
      toast.error(`Error updating exercise: ${error.message}`);
    }
  });
}

// Hook for deleting a custom exercise
export function useDeleteExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => exerciseLibraryService.deleteCustomExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting exercise:', error);
      toast.error(`Error deleting exercise: ${error.message}`);
    }
  });
}
