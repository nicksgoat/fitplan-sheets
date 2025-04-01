
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getWorkoutLibrary, 
  getProgramLibrary, 
  getWeekLibrary,
  addWorkoutToLibrary,
  addProgramToLibrary,
  addWeekToLibrary,
  removeWorkoutFromLibrary,
  removeProgramFromLibrary,
  removeWeekFromLibrary,
  updateWorkoutInLibrary,
  updateWeekInLibrary,
  updateProgramInLibrary
} from '@/utils/presets';
import { Workout, WorkoutProgram, WorkoutWeek } from '@/types/workout';
import { toast } from 'sonner';

// Define the context type
interface LibraryContextType {
  workouts: Workout[];
  programs: WorkoutProgram[];
  weeks: WorkoutWeek[];
  isLoaded: boolean;
  refreshLibrary: () => void;
  saveWorkout: (workout: Workout, name?: string) => void;
  saveProgram: (program: WorkoutProgram, name?: string) => void;
  saveWeek: (week: WorkoutWeek, name?: string) => void;
  removeWorkout: (workoutId: string) => void;
  removeProgram: (programId: string) => void;
  removeWeek: (weekId: string) => void;
  updateWorkout: (workout: Workout) => void;
  updateWeek: (week: WorkoutWeek) => void;
  updateProgram: (program: WorkoutProgram) => void;
}

// Create the context with default values
const LibraryContext = createContext<LibraryContextType>({
  workouts: [],
  programs: [],
  weeks: [],
  isLoaded: false,
  refreshLibrary: () => {},
  saveWorkout: () => {},
  saveProgram: () => {},
  saveWeek: () => {},
  removeWorkout: () => {},
  removeProgram: () => {},
  removeWeek: () => {},
  updateWorkout: () => {},
  updateWeek: () => {},
  updateProgram: () => {}
});

// Provider component
export const LibraryProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load data from localStorage
  const refreshLibrary = () => {
    setWorkouts(getWorkoutLibrary());
    setPrograms(getProgramLibrary());
    setWeeks(getWeekLibrary());
    setIsLoaded(true);
  };
  
  // Initial load
  useEffect(() => {
    refreshLibrary();
  }, []);
  
  // Save workout to library
  const saveWorkout = (workout: Workout, name?: string) => {
    const workoutToSave = { ...workout };
    
    if (name) {
      workoutToSave.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    workoutToSave.savedAt = workoutToSave.savedAt || new Date().toISOString();
    workoutToSave.lastModified = new Date().toISOString();
    
    addWorkoutToLibrary(workoutToSave);
    refreshLibrary();
    toast.success("Workout saved to library");
  };
  
  // Save program to library
  const saveProgram = (program: WorkoutProgram, name?: string) => {
    const programToSave = { ...program };
    
    if (name) {
      programToSave.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    programToSave.savedAt = programToSave.savedAt || new Date().toISOString();
    programToSave.lastModified = new Date().toISOString();
    
    addProgramToLibrary(programToSave);
    refreshLibrary();
    toast.success("Program saved to library");
  };
  
  // Save week to library
  const saveWeek = (week: WorkoutWeek, name?: string) => {
    const weekToSave = { ...week };
    
    if (name) {
      weekToSave.name = name;
    }
    
    // Make sure we have a savedAt timestamp
    weekToSave.savedAt = weekToSave.savedAt || new Date().toISOString();
    weekToSave.lastModified = new Date().toISOString();
    
    addWeekToLibrary(weekToSave);
    refreshLibrary();
    toast.success("Week saved to library");
  };
  
  // Remove workout from library
  const removeWorkout = (workoutId: string) => {
    removeWorkoutFromLibrary(workoutId);
    refreshLibrary();
    toast.success("Workout removed from library");
  };
  
  // Remove program from library
  const removeProgram = (programId: string) => {
    removeProgramFromLibrary(programId);
    refreshLibrary();
    toast.success("Program removed from library");
  };
  
  // Remove week from library
  const removeWeek = (weekId: string) => {
    removeWeekFromLibrary(weekId);
    refreshLibrary();
    toast.success("Week removed from library");
  };
  
  // Update existing items
  const updateWorkout = (workout: Workout) => {
    updateWorkoutInLibrary(workout);
    refreshLibrary();
  };
  
  const updateWeek = (week: WorkoutWeek) => {
    updateWeekInLibrary(week);
    refreshLibrary();
  };
  
  const updateProgram = (program: WorkoutProgram) => {
    updateProgramInLibrary(program);
    refreshLibrary();
  };
  
  return (
    <LibraryContext.Provider value={{
      workouts,
      programs,
      weeks,
      isLoaded,
      refreshLibrary,
      saveWorkout,
      saveProgram,
      saveWeek,
      removeWorkout,
      removeProgram,
      removeWeek,
      updateWorkout,
      updateWeek,
      updateProgram
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

// Custom hook to use the library context
export const useLibrary = () => useContext(LibraryContext);
