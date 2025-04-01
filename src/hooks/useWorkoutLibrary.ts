
import { useLibrary } from '@/contexts/LibraryContext';

// This hook is now a wrapper around the LibraryContext for backward compatibility
export function useWorkoutLibrary() {
  return useLibrary();
}
