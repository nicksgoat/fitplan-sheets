import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import * as exerciseLibraryService from '@/services/exerciseLibraryService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['custom-exercises', user?.id],
    queryFn: () => exerciseLibraryService.getCustomExercises(user?.id),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user
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

// Hook for fetching exercises with their visuals
export function useExercisesWithVisuals() {
  return useExercises();
}

// Hook for uploading a video for an exercise
export function useUploadExerciseVideo() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadVideo = async (file: File, userId?: string) => {
    if (!file) {
      throw new Error('No file selected');
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Video size exceeds the maximum allowed size of 50MB.');
      throw new Error('File too large. Maximum size is 50MB.');
    }
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 300);
      
      const videoUrl = await exerciseLibraryService.uploadExerciseVideo(file, userId);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return videoUrl;
    } catch (error) {
      setProgress(0);
      
      if (error instanceof Error) {
        if (error.message.includes('Payload too large')) {
          toast.error('Video file is too large. Maximum file size is 50MB.');
          throw new Error('Video file is too large. Maximum file size is 50MB.');
        }
      }
      
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { uploadVideo, progress, isUploading };
}

// Hook for creating a custom exercise
export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (exercise: Omit<Exercise, 'id'>) => 
      exerciseLibraryService.addCustomExercise({ ...exercise, userId: user?.id }),
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
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ id, exercise }: { id: string, exercise: Partial<Exercise> }) => 
      exerciseLibraryService.updateCustomExercise(id, { ...exercise, userId: user?.id }),
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
