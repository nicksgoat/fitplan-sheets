
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import * as exerciseLibraryService from '@/services/exerciseLibraryService';
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

// Hook for fetching all exercises including custom exercises
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

// Hook for fetching custom exercises specifically
export function useCustomExercises() {
  return useQuery({
    queryKey: ['custom-exercises'],
    queryFn: exerciseLibraryService.getCustomExercisesFromLocalStorage,
    staleTime: 1 * 60 * 1000, // 1 minute
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

// Hook for fetching exercises with their visuals (now just returns exercises with consolidated data)
export function useExercisesWithVisuals() {
  return useExercises();
}

// Hook for creating a custom exercise
export function useCreateExercise() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (exercise: Omit<Exercise, 'id'>) => 
      exerciseLibraryService.addCustomExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['custom-exercises'] });
      toast.success('Exercise created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating exercise:', error);
      // Don't show error toast here as it's handled in the service
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
      queryClient.invalidateQueries({ queryKey: ['custom-exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise', variables.id] });
      toast.success('Exercise updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating exercise:', error);
      // Don't show error toast here as it's handled in the service
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
      queryClient.invalidateQueries({ queryKey: ['custom-exercises'] });
      toast.success('Exercise deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting exercise:', error);
      // Don't show error toast here as it's handled in the service
    }
  });
}
