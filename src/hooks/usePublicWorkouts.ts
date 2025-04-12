
import { useQuery } from '@tanstack/react-query';
import { fetchPublicWorkouts, fetchPublicPrograms } from '@/services/workoutService';

export function usePublicWorkouts() {
  return useQuery({
    queryKey: ['publicWorkouts'],
    queryFn: fetchPublicWorkouts,
  });
}

export function usePublicPrograms() {
  return useQuery({
    queryKey: ['publicPrograms'],
    queryFn: fetchPublicPrograms,
  });
}
